// import the required modules
require('dotenv').config({ path:('./../.env') })
const cors = require('cors')
const express = require('express')
const {apiRoutes} = require('./routes/api');

const app = express()
const port = 3000
// allows cross origin requests
app.use(cors());
// allows json and urlencoded requests
app.use(express.urlencoded({extended: true}));


app.use('/api', apiRoutes);

// starts the server at port 3000
app.listen(port, () => {
    console.log(`Controller Running at port: ${port}`)
  });