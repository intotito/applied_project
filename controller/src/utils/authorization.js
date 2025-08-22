const jwt = require("jsonwebtoken");

// this function authorizes the bearer token
authorizeBearer = function(req, res, next) {
    if(req.headers && req.headers.authorization){
        let token = req.headers.authorization.split(' ')[1];
        console.log('Token: ', token, process.env.API_JWT_KEY);
        const decodedToken = jwt.verify(token, process.env.API_JWT_KEY);
        if(decodedToken){
            res.locals.userId = decodedToken.userId;
            console.log('Authorization Successful');
            next();
        } else {
            res.status(401).send('<h1>Unauthorized, Invalid or Expired Token</h1>');
        }
    } else {
        res.status(401).send('<h1>Unauthorized, No Authentication Token Provided</h1>');
    }
};

// this function creates a jwt token
async function createAuthority(userName) {
    return new Promise(async (resolve, reject) => {    
        console.log(process.env.API_JWT_KEY);
        let token;
        try {
            //Creating jwt token
            token = jwt.sign(
                {
                    userId: `${userName}`,
                },
                process.env.API_JWT_KEY,
            );
            console.log('Token: ', token);
            resolve(token);
        } catch (err) {
            console.log(err);
            const error =
                new Error("Error! Something went wrong.");
            reject(error);
        }
    });
}

module.exports = {
    createAuthority: createAuthority,
    authorizeBearer: authorizeBearer
};