require('dotenv').config({ path:('./../.env') })
const cors = require('cors')
const mysql = require('mysql2')
const firestore = require('./db/firebase')
const firestore_db = firestore.firestore;
const express = require('express')
const app = express()
const port = 3000

app.use(cors());

app.get('/api', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/dataset', (req, res) => { 
    getDataSet().then((value) => {
        res.json(value);
    });
});

app.get('/api/sync', (req, res) => {
    syncDatabase().then((value) => {
        res.json(value);
    })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

async function fetchData(db, start){
    start = new Date("2021-03-25");
    console.log("Start: ", start);
    let quit = 0;
    return new Promise(async (resolve, reject) => {
        data = [];
        dataWatch = [];
        const querySnapshot = await db.collection('users').get();
        for(let j = 0; j < querySnapshot.docs.length; j++){
            let result = querySnapshot.docs[j];
            const user = result.data().handle;
            const querySnapshot1 = await db.collection('users').doc(result.id).collection('tests').where('timestamp', '>', start).get();
            const querySnapshot2 = await db.collection('users').doc(result.id).collection('watches').where('timestamp', '>', start).get();
            for(let i = 0; i < querySnapshot2.docs.length; i++){
                let result2 = querySnapshot2.docs[i];
                const valuable = {
                    _date: null,
                    bm_HR_max: null,
                    bm_HR_avg: null,
                    bm_HR_var: null,
                    bm_act_steps: null,
                    bm_sleep: null,
                };
                const testData = await result2.data();
                valuable._date = testData.timestamp?.toDate();
                const polar = testData.polar;
        //        console.log(polar)
                if(polar?.recharges){
                    valuable.bm_HR_var = polar.recharges.hrv;
                    valuable.bm_HR_avg = polar.recharges.heartRateAvg;
                    valuable.bm_sleep = polar.recharges.nightlyRechargeStatus;
                } 
                if(polar?.physicalInfo){
                    valuable.bm_HR_max = polar.physicalInfo.maxiHeartRate;
                }
                if(polar?.activity){
                    valuable.bm_act_steps = polar.activity.activeSteps;
                }
                dataWatch.push(valuable);
            }
            
           


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
            }

            for(let k = 0; k < data.length; k++){
                let date1 = data[k]._date;
                for(let m = 0; m < dataWatch.length; m++){
                    let date2 = dataWatch[m]._date;
                    if(compareDates(date1, date2)){
                        // assign dataWatch[m] to data[k]
                        data[k].bm_HR_max =     dataWatch[m].bm_HR_max;
                        data[k].bm_HR_avg =     dataWatch[m].bm_HR_avg;
                        data[k].bm_HR_var =     dataWatch[m].bm_HR_var;
                        data[k].bm_act_steps =  dataWatch[m].bm_act_steps
                        data[k].bm_sleep =      dataWatch[m].bm_sleep;
                        console.log("Big Prize: ", data[k]);
                    }
                }
            }

        }
        resolve(data);
    })
}

function compareDates(date1, date2){
    return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getLatestSyncDate(db){
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

async function getDataSet(){
    return new Promise(async (resolve, reject) => {
        const mysql_db = await initializeDatabase();
        const query = `SELECT * FROM Stats;`
        mysql_db.query(query, (error, result, field) => {
            if(error){
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
    return datePromise;
}

async function syncDatabase(){
    const db = await initializeDatabase();
    var last = await getLatestSyncDate(db);
    const data = await fetchData(firestore_db, last);
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

    db.query(query, ((error, results, field) => {
        console.log("Query Result", results, error, field);
    }));
    db.query(query1, ((error, results, field) => {
        console.log("Query Result", results, error, field);
    }));

    db.end((err) => {
        if(err){
            console.log(err);
        }
    });
}

function formatDate(date){
    if(typeof date == 'string'){
        date = new Date(date);
        console.log(date, typeof date);
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

