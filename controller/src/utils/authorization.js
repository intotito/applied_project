const jwt = require("jsonwebtoken");
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