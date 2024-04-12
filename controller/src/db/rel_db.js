const { populate } = require('dotenv');
const mysql = require('mysql2');

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
        query = `SELECT (title, path) FROM SubPaths WHERE session_id = ${hash};`
        db.query(query, (error, result, field) => { 
            if(error){
                console.log(error);
                reject({error: error});
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
        for(let i = 0; i < Object.keys(result); i++){
            query += `(hash, ${Object.keys(result)[i]}, ${Object.values(result)[i]})`;
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

module.exports = {
    initializeDatabase: initializeDatabase,
    getLatestSyncDate: getLatestSyncDate,
    queue: queueRequest, 
    populateQueue: populateQueue
};