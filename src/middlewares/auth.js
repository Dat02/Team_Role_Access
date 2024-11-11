const { errorHandler } = require("./error");
const jwt = require('jsonwebtoken');


const verifyToken = (req,res,next) => {

    try {
        const token = req.cookies.jwt;
        if(!token) return next();
        
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE, (err,user) => {
            if(err) return next(errorHandler(404, 'token is not valid'));
            req.user = user;
            next();  
        });
    } catch (error) {
        next(error);
    }
   
}

module.exports = {verifyToken}