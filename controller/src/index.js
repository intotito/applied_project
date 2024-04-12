// import the required modules
require('dotenv').config({ path:('./../.env') })
const cors = require('cors')
const express = require('express')
const {formatDate} = require('./utils/utils');
const {authorizeBearer} = require('./utils/authorization');
const {initializeDatabase, getLatestSyncDate, queue, populateQueue} = require('./db/rel_db');
const {fetchData} = require('./db/firebase');
const fs = require('fs');
const path = require('path');
const {exec} = require('child_process');
const os = require('os');

const app = express()
const port = 3000
// allows cross origin requests
app.use(cors());
// allows json and urlencoded requests
app.use(express.urlencoded({extended: true}));
//app.use(authorizeBearer);
// test endpoint
app.get('/api', (req, res) => {
    console.log(process.env)
  res.send('<h1>Hello World!</h1>')
});

app.get('/api/ai', (req, res) => {
    // create a 6 digit hexadecimal hashcode with current timestamp
    // current epoch time in milliseconds
    
    const hash = Math.floor(new Date().getTime()).toString(16);
    var tmpDir = '';
    try{
        tmpDir = fs.mkdirSync(path.join(os.tmpdir(), hash));
    } catch (err){
        console.error('*************************************', err);
    } 
//    console.log('----------------- Temporary Directory: ----------------------------------- ', tmpDir)
//    console.log('Home Directory: ', process.env.HOMEPATH, os.homedir(), process.env.AI_ADDRESS_2, process.env.PROJECT_PATH);
    let aiModules = {
        "test": `${process.env.HOME}/${process.env.AI_TEST_ADDRESS}`,
        "regression": `${process.env.HOME}/${process.env.AI_ADDRESS_1}`,
        "neuralNetwork": `${process.env.HOME}/${process.env.PROJECT_PATH}/${process.env.AI_ADDRESS_2}`,
    }
    const result = exec(`python3 ${aiModules['test']} ${hash}`, {timeout: 120000},(error, result, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${result}`);
        console.error(`stderr: ${stderr}`);
        populateQueue(hash, result)
    });
 //   console.log('-----------------', result.toString(), '--------------------------------------------------------------');
    //res.json(JSON.parse(result.toString()));
        queue(hash)
        res.json({session: hash});
});

app.get('/api/transaction/:id', (req, res) => {
    let session_id = req.params.id;
    console.log("Session_Id: ", session_id);
    res.json(getTransaction(session_id));
})
    

app.get('/api/images/:session/:file', (req, res) => {
    console.log(req.params.session, req.params.file);
    let dir = path.join(os.tmpdir(), req.params.session);
        if(fs.existsSync(dir)){
            let file = path.join(os.tmpdir(), req.params.session, req.params.file);
            res.sendFile(file);
        } else {
            res.send('<h1>Session not found</h1>');
        }        
    
});

// this is the endpoint that returns the dataset
app.get('/api/dataset', authorizeBearer, (req, res) => { 
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
app.get('/api/sync', authorizeBearer, (req, res) => {
    syncDatabase(res.locals.userId).then((value) => {
        res.json(value);
    }).catch(error => {
        res.status(505).send('<h1>Syncing failed</h1>')
        console.log(error)
    })
})
// this is the endpoint that resets the database
app.get('/api/reset', authorizeBearer, (req, res) => {
    resetDatabase().then((value) => {
        res.json(value);
    }).catch(error => {
        res.status(505).send('<h1>Reset failed</h1>')
        console.log(error)
    })
})



// starts the server at port 3000
app.listen(port, () => {
  console.log(`Controller Running at port: ${port}`)
})

// this function resets the database
resetDatabase = async function (){
    return new Promise(async (resolve, reject) => {
        const db = await initializeDatabase();
        const filePath = path.join('./db/', 'database.sql');
        const queries = fs.readFileSync(filePath).toString().split(';');
        // print out the queries
        for(let i = 0; i < queries.length; i++){
            let query = queries[i].trim();
            // ignore if string starts with '#'
            if(query.startsWith('#') || query.length == 0){
                continue;
            }
            db.query(query, (error, result, field) => {
                if(error){
                    console.log(error);
                    reject(error);
                }
            });
        }
        db.end((err) => {
            if(err){
                console.log(err);
            }
        });
        resolve("Database Reset");
    })
};

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
            query += `('${formatDate(data[i]._date)}', '${data[i]._user}', ${data[i].fm_avg_trk_time},` +
                    `${data[i].fm_accuracy}, ${data[i].vx_avg_res_time}, ${data[i].vx_shot_accuracy} ,` +
                    `${data[i].vx_trg_accuracy}, ${data[i].au_avg_res_time}, ${data[i].bm_HR_max}, ` +
                    `${data[i].bm_HR_avg || null}, ${data[i].bm_HR_var || null}, ${data[i].bm_act_steps || null}, ${data[i].bm_sleep || null})`;
            
            if(i != data.length - 1){
                query += ", "
            }
        }
    }
    query += ";"  
    let query1 = `INSERT INTO Syncs (user_id, class_id, sync_date) VALUES ('${userId}', 0, '${formatDate(last.toDateString())}');`;
    db.query(query, ((error, results, field) => {
        console.log("Query Result", results, 'Error:', error);
    }));
    db.query(query1, ((error, results, field) => {
        console.log("Query Result1", results, 'Error:', error);
    }));

    db.end((err) => {
        if(err){
            console.log(err);
        }
    });
}