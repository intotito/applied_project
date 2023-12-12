require('dotenv').config()
require('cors')
const mysql = require('mysql2')
const firestore = require('./db/firebase')
const firestore_db = firestore.firestore;
const express = require('express')
const app = express()
const port = 3000


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

mainMan = [];

async function add(a){
    mainMan.push(a);
}

async function fetchData(db, start){
    return new Promise(async (resolve, reject) => {
        data = [];
        const querySnapshot = await db.collection('users').get();
        for(let j = 0; j < querySnapshot.docs.length; j++){
            let result = querySnapshot.docs[j];
//        querySnapshot.forEach(async (result) => {
            const user = result.data().handle;
            const querySnapshot1 = await db.collection('users').doc(result.id).collection('tests').get();
  //          querySnapshot1.forEach(async (result1) => {
            for(let i = 0; i < querySnapshot1.docs.length; i++){
                let result1 = querySnapshot1.docs[i];
                const valuable = {
                    _id: null,
                    _date: null,
                    _user: null,
                    fm_avg_trk_time: null,
                    fm_accuracy: null,
                    vx_avg_res_time: null,
                    vx_shot_accuracy: null,
                    vx_trg_accuracy: null,
                    au_avg_res_time: null,
                    bm_HR_max: null,
                    bm_HR_avg: null,
                    bm_HR_var: null,
                    bm_act_steps: null,
                    bm_sleep: null,
                };
                valuable._user = user;
                const testData = await result1.data();
                if(testData.timestamp){
                    valuable._date = testData.timestamp?.toDate();
                } else {
                    valuable._date = null;
                }
                if(testData.audio){
                    const au_avgResp = testData.audio.avgResponseTime;
                    valuable.au_avg_res_time = Number.isNaN(au_avgResp) ? null : au_avgResp;
                } else {
                    valuable.au_avg_res_time = null;
                }
                if(testData.fineMotor){
                    const fm_avgTrackTime = testData.fineMotor.avgTrackingTime;
                    const fm_acc = testData.fineMotor.accuracy;
                    valuable.fm_avg_trk_time = fm_avgTrackTime;
                    valuable.fm_accuracy = fm_acc;
                } else {
                    valuable.fm_avg_trk_time = null;
                    valuable.fm_accuracy = null;
                }
                if(testData.visual){
                    let i = 0;
                    let sum = 0;
                    for(; testData.visual.responseTimes[i]; i++){
                        sum += testData.visual.responseTimes[i];
                    }
                    const vx_avgResp = Number.isNaN(sum / i) ? null : (sum / i);
                    const vx_shotAcc = testData.visual.shotAccuracy;
                    const vx_targetAcc = testData.visual.targetAccuracy;
                    valuable.vx_avg_res_time = Number.isNaN(vx_avgResp) ? null : vx_avgResp;
                    valuable.vx_shot_accuracy = Number.isNaN(vx_shotAcc) ? null : vx_shotAcc;
                    valuable.vx_trg_accuracy = Number.isNaN(vx_targetAcc) ? null : vx_targetAcc;
                } else {
                    valuable.vx_avg_res_time = null;
                    valuable.vx_shot_accuracy = null;
                    valuable.vx_trg_accuracy = null;
                }
                data.push(valuable);
   //             add(valuable);
            }
   //         );
        }
  //      );
        resolve(data);
    })
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getLatestSyncDate(db){
    return new Promise((resolve, reject) => {
        query = `SELECT MAX(sync_date) AS latest_date FROM Syncs;`;
        db.query(query, (error, result, field) => {
            if(!error && result.length > 0){
                resolve(result[0].latest_date)
            } else {
                resolve(new Date("December 15, 2002"));
            }
        });
    });
}


async function main() {
    const mysql_db = await initializeDatabase();
    const start = await getLatestSyncDate(mysql_db);
    const data = await fetchData(firestore_db, start);
    console.log(data);
 //   await sleep(3000);
 //   console.log(mainMan);
//    syncDatabase(mysql_db, mainMan);
}

async function initializeDatabase(){
    const rel_db = mysql.createConnection({
        host: process.env.DB_ADDRESS,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD, 
        database: process.env.DB_DATABASE
    })
    const datePromise = new Promise((resolve, reject) => {
        rel_db.connect((err) => {
            if(!err){
                resolve(rel_db);
            } else {
                reject(error);
            }
        });
    });
    return datePromise;
}

function syncDatabase(db, data){
    let schema = {
        _id: null,
        _date: null,
        _user: null,
        fm_avg_trk_time: null,
        fm_accuracy: null,
        vx_avg_res_time: null,
        vx_shot_accuracy: null,
        vx_trg_accuracy: null,
        au_avg_res_time: null,
        bm_HR_max: null,
        bm_HR_avg: null,
        bm_HR_var: null,
        bm_act_steps: null,
        bm_sleep: null,
    };

    let last = new Date("December 15, 2002");
    let query = "INSERT INTO Stats(_date, _user, fm_avg_trk_time, fm_accuracy," +
                "vx_avg_res_time, vx_shot_accuracy, vx_trg_accuracy, au_avg_res_time, bm_HR_max," +
                "bm_HR_avg, bm_HR_var, bm_act_steps, bm_sleep) VALUES";
    for(let i = 0; i < data.length; i++){
        if(data[i]._date && data[i]._date > last){
            last = data[i]._date;
        }
        if(data[i]._date){
        query += `('${formatDate(data[i]._date)}', '${data[i]._user}', ${data[i].fm_avg_trk_time},` +
                 `${data[i].fm_accuracy}, ${data[i].vx_avg_res_time}, ${data[i].vx_shot_accuracy} ,` +
                 `${data[i].vx_trg_accuracy}, ${data[i].au_avg_res_time}, ${data[i].bm_HR_max}, ` +
                 `${data[i].bm_HR_avg}, ${data[i].bm_HR_var}, ${data[i].bm_act_steps}, ${data[i].bm_sleep})`;
        if(i != data.length - 1){
            query += ", "
        }
        }
    }
    query += ";"

    let query1 = `INSERT INTO Syncs (user_id, class_id, sync_date) VALUES ('intotito', 0, '${formatDate(last.toDateString())}');`;

 //   console.log("Latest Addition: ", last);

    db.query(query, ((error, results, field) => {
        console.log("Query Result", results, error, field);
    }));
    db.query(query1, ((error, results, field) => {
        console.log("Query Result", results, error, field);
    }));
}

function formatDate(date){
    if(!date){
        return '0000-00-00 00:00:00';
    }
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDay();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let seconds = date.getSeconds();
    let milSeconds = date.getMilliseconds();
    return `${year}-${month}-${day} ${hour}:${minute}:${seconds}.${milSeconds}`
}


main();