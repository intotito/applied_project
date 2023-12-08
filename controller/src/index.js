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


const snapshot = db.collection('users').get();
snapshot.then(data => data.forEach((doc) => {
  console.log(doc.id, '=>', doc.data());
})
).catch(error => console.log(error));


