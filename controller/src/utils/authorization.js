const jwt = require("jsonwebtoken");

// this function authorizes the bearer token
exports.authorizeBearer = function(req, res, next) {
    if(req.headers && req.headers.authorization){
        let token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.API_JWT_KEY);
        if(decodedToken){
            res.locals.userId = decodedToken.userId;
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
        return token;
    } catch (err) {
        console.log(err);
        const error =
            new Error("Error! Something went wrong.");
        return error;
    }
}