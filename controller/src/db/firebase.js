const {initializeApp} = require('firebase-admin/app')
const {getFirestore} = require('firebase-admin/firestore')
const {compareDates} = require('./../utils/utils')

const {
    API_KEY,
    AUTH_DOMAIN,
    DATABASE_URL,
    PROJECT_ID,
    STORAGE_BUCKET,
    MESSAGING_SENDER_ID,
    APP_ID,
    MEASUREMENT_ID
} = process.env;

const firebaseConfig = {
    apiKey: API_KEY,
    authDomain: AUTH_DOMAIN,
    databaseURL: DATABASE_URL,
    projectId: PROJECT_ID,
    storageBucket: STORAGE_BUCKET,
    messagingSenderId: MESSAGING_SENDER_ID,
    appId: APP_ID,
    measurementId: MEASUREMENT_ID
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// fetches data from firebase
fetchData = async function (start){
    let db = getFirestore();
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
                    _id: null, _date: null, _user: null, fm_avg_trk_time: null, fm_accuracy: null,
                    vx_avg_res_time: null, vx_shot_accuracy: null, vx_trg_accuracy: null, au_avg_res_time: null, 
                    bm_HR_max: null, bm_HR_avg: null, bm_HR_var: null, bm_act_steps: null, bm_sleep: null,
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
                }
            }
        }
        resolve(data);
    })
}

module.exports = {
    fetchData: fetchData
};