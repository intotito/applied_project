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
    getLatestSyncDate: getLatestSyncDate
};