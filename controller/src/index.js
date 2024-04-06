// import the required modules
require('dotenv').config({ path:('./../.env') })
const cors = require('cors')
const express = require('express')
const {formatDate} = require('./utils/utils');
const {authorizeBearer} = require('./utils/authorization');
const {initializeDatabase, getLatestSyncDate} = require('./db/rel_db');
const {fetchData} = require('./db/firebase')

const app = express()
const port = 3000
// allows cross origin requests
app.use(cors());
// allows json and urlencoded requests
app.use(express.urlencoded({extended: true}));

// test endpoint
app.get('/api', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.use(authorizeBearer);
// this is the endpoint that returns the dataset
app.get('/api/dataset', (req, res) => { 
    console.log('Request params', req.query['submit']);
    let whereClause = ''
    if(req.query['submit'] && req.query['submit'] === 'clean'){
        let array = req.query['columns'];
        let isArray = Array.isArray(array);
        let qry = isArray ? ' WHERE ' : ` WHERE ${array} IS NOT NULL `;
        for(let i = 0; i < array.length && isArray; i++){
            qry += `${array[i]} IS NOT NULL`;
            if(i != array.length - 1){
                qry += ' AND ';
            }
        }
        whereClause = qry;
    }
    getDataSet(whereClause).then((value) => {
        res.json(value);
    }).catch(error => {
        res.status(202).send('<h1>Empty Data</h1>'
        )
        console.log(error)
    });
});

// this is the endpoint that syncs the database
app.get('/api/sync', (req, res) => {
    syncDatabase(res.locals.userId).then((value) => {
        res.json(value);
    }).catch(error => {
        res.status(505).send('<h1>Syncing failed</h1>')
        console.log(error)
    })
})

// starts the server at port 3000
app.listen(port, () => {
  console.log(`Controller Running at port: ${port}`)
})

// this function gets the dataset from the database
async function getDataSet(whereClause){
    return new Promise(async (resolve, reject) => {
        const mysql_db = await initializeDatabase();
        const query = `SELECT * FROM Stats ${whereClause};`
        mysql_db.query(query, (error, result, field) => {
            if(error){
                console.log(error)
                reject(error);
            } else {
                resolve(result);
                mysql_db.end((err) => {
                    if(err){
                        console.log(err);
                    }
                })
                console.log("fields", field);
            }
        });
    });
}

// this function syncs the relational database with the firebase database
async function syncDatabase(userId){
    const db = await initializeDatabase();
    var last = await getLatestSyncDate(db);
    const data = await fetchData(last);
    let query = "INSERT INTO Stats(_date, _user, fm_avg_trk_time, fm_accuracy, " +
                "vx_avg_res_time, vx_shot_accuracy, vx_trg_accuracy, au_avg_res_time, bm_HR_max, " +
                "bm_HR_avg, bm_HR_var, bm_act_steps, bm_sleep) VALUES";
    for(let i = 0; i < data.length; i++){
        if(data[i]._date && data[i]._date > last){
            last = data[i]._date;
        }
        if(data[i]._date){
            let buff = `('${formatDate(data[i]._date)}', '${data[i]._user}', ${data[i].fm_avg_trk_time},` +
                    `${data[i].fm_accuracy}, ${data[i].vx_avg_res_time}, ${data[i].vx_shot_accuracy} ,` +
                    `${data[i].vx_trg_accuracy}, ${data[i].au_avg_res_time}, ${data[i].bm_HR_max}, ` +
                    `${data[i].bm_HR_avg || null}, ${data[i].bm_HR_var || null}, ${data[i].bm_act_steps || null}, ${data[i].bm_sleep || null})`;
            query += buff
            console.log('Buff --------------------- ', buff);
            if(i != data.length - 1){
                query += ", "
            }
        }
    }
    query += ";"  
    let query1 = `INSERT INTO Syncs (user_id, class_id, sync_date) VALUES ('${userId}', 0, '${formatDate(last.toDateString())}');`;
    db.query(query, ((error, results, field) => {
        console.log("Query Result", results, "Error: ", error, "Fields: ", field);
    }));
    db.query(query1, ((error, results, field) => {
        console.log("Query Result1", results, error, field);
    }));

    db.end((err) => {
        if(err){
            console.log(err);
        }
    });
}