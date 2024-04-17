const express = require('express')
const {authorizeBearer, createAuthority} = require('./../utils/authorization');
const {resetDatabase, queue, populateQueue, getTransaction} = require('./../db/rel_db');

const fs = require('fs');
const path = require('path');
const {exec} = require('child_process');
const os = require('os');
const router = express.Router();

// test endpoint
router.get('/', (req, res) => {
//  console.log(process.env)
  res.send('<h1>Hello World!</h1>')
});

// this is the endpoint that returns the dataset
router.get('/dataset', authorizeBearer, (req, res) => { 
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
router.get('/sync', authorizeBearer, (req, res) => {
    syncDatabase(res.locals.userId).then((value) => {
        res.json(value);
    }).catch(error => {
        res.status(505).send('<h1>Syncing failed</h1>')
        console.log(error)
    })
})

// this is the endpoint that starts an AI module
router.get('/ai/:id', (req, res) => {
    let id = req.params.id;
    // create a session hash
    const hash = Math.floor(new Date().getTime()).toString(16);
    var tmpDir = '';
    try{
        // create a temporary folder for the session
        tmpDir = fs.mkdirSync(path.join(os.tmpdir(), hash));
    } catch (err){
        console.error(err);
    } 
    // setup paths to the AI modules
    let aiModules = {
        "test": `${process.env.HOME}/${process.env.AI_TEST_ADDRESS}`,
        "regression": `${process.env.HOME}/${process.env.AI_ADDRESS_1}`,
        "neurons": `${process.env.HOME}/${process.env.PROJECT_PATH}/${process.env.AI_ADDRESS_2}`,
    }
    // execute the AI module asynchronously
    exec(`python3 ${aiModules[id]} ${hash}`, {timeout: 120000},(error, result, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        populateQueue(hash, result)
    });
    // register the session 
    queue(hash)
    // return the session hash to the client
    res.json({session: hash});
});

// this endpoint returns the transaction details
router.get('/transaction/:id', async (req, res) => {
    let session_id = req.params.id;
    res.json(await getTransaction(session_id));
})

// this endpoint returns images
router.get('/images/:session/:file', (req, res) => {
    let dir = path.join(os.tmpdir(), req.params.session);
        if(fs.existsSync(dir)){
            let file = path.join(os.tmpdir(), req.params.session, req.params.file);
            res.sendFile(file);
        } else {
            res.status.send('<h1>Session not found</h1>');
        }        
    
});

// require {userName: 'username', secret: 'secret-key'}
router.post('/authorize', authorizeBearer, (req, res) => {
    console.log('Request Body', req.body);
    if(!req.body.userName || !req.body.secret || req.body.secret != process.env.API_JWT_KEY){
        res.status(400).send('<h1>Invalid Request</h1>');
    }
    createAuthority(req.body.userName).then((value) => {
        res.json(value);
    }).catch(error => {
        res.status(505).send('<h1>Authorization failed</h1>')
        console.log(error)
    });
})

// this is the endpoint that resets the database
router.get('/reset', authorizeBearer, (req, res) => {
    resetDatabase().then((value) => {
        res.json(value);
    }).catch(error => {
        res.status(505).send('<h1>Reset failed</h1>')
        console.log(error)
    })
})
module.exports = {
    apiRoutes: router
}
