//const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
//const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
require('dotenv').config()
const firestore = require('./db/firebase')

const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

//const document = firestore.doc('posts/intro-to-firestore');
  // Read the document.
 // const doc = await document.get();
 // console.log('Read the document', doc);

const db = firestore.firestore;
/*

const snapshot = db.collection('users').get();
snapshot.then(data => data.forEach((doc) => {
  console.log(doc.id, '=>', doc.data());
})
).catch(error => console.log(error));

*/

mainMan = [];

async function add(a){
//    console.log("000000000000000", mainMan.length);
//    console.log(a);
    mainMan.push(a);
}

async function getAllUsersId(){
//    const snapshot = db.collection('users').get();
    const querySnapshot = await db.collection('users').get();

 //   snapshot.then(querySnapshot => {
            querySnapshot.forEach(async (result) => {

                const user = result.data().handle;
                const querySnapshot1 = await db.collection('users').doc(result.id).collection('tests').get();
//                .then(querySnapshot1 => {
                    querySnapshot1.forEach(async (result1) => {
                        const valuable = {};
                        valuable._user = user;
                        const testData = result1.data();
                        if(testData.timestamp){
                            valuable._date = testData.timestamp?.toDate().toDateString();
                        } else {
                            valuable._date = null;
                        }
                        const date = testData.timestamp?.toDate().toDateString();
                        if(testData.audio){
                            const au_avgResp = testData.audio.avgResponseTime;
                            valuable.au_avg_res_timex = au_avgResp;
                        } else {
                            valuable.au_avg_res_timex = null;
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
                            const vx_avgResp = sum / i;
                            const vx_shotAcc = testData.visual.shotAccuracy;
                            const vx_targetAcc = testData.visual.targetAccuracy;
                            valuable.vx_avg_res_time = vx_avgResp;
                            valuable.vx_shot_accuracy = vx_shotAcc;
                            valuable.vx_trg_accuracy = vx_targetAcc;

    //                      console.log("Visual:\t", vx_avgResp, '\t', vx_shotAcc, '\t', vx_targetAcc);
                        } else {
                            valuable.vx_avg_res_time = null;
                            valuable.vx_shot_accuracy = null;
                            valuable.vx_trg_accuracy = null;
                        }
    //                    console.log(result1.id,  result1.data().timestamp.toDate().toDateString())
                        add(valuable);
                    })

                })
//            })
//    });

}

function sleeper(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function sleep() {
    await getAllUsersId();
    await sleeper(3000);
    console.log("-------------------", mainMan);
}
sleep();
//getAllUsersId().then(data => console.log(data));