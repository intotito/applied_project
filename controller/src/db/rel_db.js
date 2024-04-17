const mysql = require('mysql2');
const {fetchData} = require('./firebase');
const {formatDate} = require('.././utils/utils');
const fs = require('fs');

initializeDatabase = async function (){
    const rel_db = mysql.createConnection({
        host: process.env.DB_ADDRESS,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD, 
        database: process.env.DB_DATABASE
    })
    const dbPromise = new Promise((resolve, reject) => {
   //     console.log(process.env);
        rel_db.connect((err) => {
            if(!err){
                resolve(rel_db);
            } else {
                console.log(err);
                reject(err);
            }
        });
    });
    return dbPromise;
}

queueRequest = async function(path){
    return new Promise(async (resolve, reject) => {
        db = await initializeDatabase();
        query = `INSERT INTO Paths (session_id) VALUES ('${path}');`;
        db.query(query, (error, result, field) => {
            if(error){
                console.log(error);
                reject(false);
            }
            else {
                resolve(true);
            }
        });
    });
}

getTransaction = async function(hash){
    return new Promise(async (resolve, reject) => {
        db = await initializeDatabase();
        query = `SELECT title, path FROM SubPaths WHERE session_id = '${hash}';`
        db.query(query, (error, result, field) => { 
            if(error){
                console.log(error);
                reject({});
            } else {
                let finalResult = {};
                for(let i = 0; i < result.length; i++){
                    finalResult[result[i].title] = result[i].path;
                }
                resolve(finalResult);
            }
        });
    });
}

populateQueue = async function(hash, result){
    return new Promise(async (resolve, reject) => {
        db = await initializeDatabase();
        query = `INSERT INTO SubPaths (session_id, title, path) VALUES `;
        console.log("Result", result)
        result = JSON.parse(result);
        for(let i = 0; i < Object.keys(result).length; i++){
            query += `('${hash}', '${Object.keys(result)[i]}', '${Object.values(result)[i]}')`;
            query += (i != Object.keys(result).length - 1) ? ", " : ";";  
        } 
        db.query(query, (error, result, field) => {
            if(error){
                console.log(error);
                reject({error: error})
            } else {
                resolve(true);
            }
        })
    })
}

getLatestSyncDate = async function (db){
    return new Promise((resolve, reject) => {
        query = `SELECT MAX(sync_date) AS latest_date FROM Syncs;`;
        db.query(query, (error, result, field) => {
            console.log(result, result.length);
            if(error || result[0].latest_date == null){
                resolve(new Date("December 15, 2002"));
            }
            else {
                resolve(result[0].latest_date)
            }
        });
    });
}

// this function gets the dataset from the database
getDataSet = async function(whereClause){
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
syncDatabase = async function (userId){
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

// this function resets the database
resetDatabase = async function (){
    return new Promise(async (resolve, reject) => {
        const db = await initializeDatabase();
        const filePath = './db/database.sql';
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

module.exports = {
    initializeDatabase: initializeDatabase,
    getLatestSyncDate: getLatestSyncDate,
    queue: queueRequest, 
    populateQueue: populateQueue,
    getTransaction: getTransaction,
    syncDatabase: syncDatabase,
    getDataSet: getDataSet, 
    resetDatabase: resetDatabase
};