
const {errorHandler} = require('./error');
const jwt = require('jsonwebtoken');


const verifyToken = (req,res,next) => {
    const token = req.cookies.jwt;
    if(!token) return next(errorHandler(401, 'token not found'));

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE, (err, user) => {
        if(err) return next(errorHandler(403, 'token is not valid'));
        req.user = user;
        next();
    })
}


const isUser = (req,res,next) => {
    const token = req.cookies.jwt;
    if(!token) return next();

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE, (err, user) => {
        if(err) return next(errorHandler(403, 'token is not valid'));
        req.user = user;
        next();
    })
}

const checkRole = (assign) => {

    return (req,res,next) => {

        const role = req.user.role_id;
        if(!role) return next(errorHandler(401, 'cant find your role'));
        if(role != assign) return next(errorHandler(404, 'your role can not do this action'));

        next();
    }
}

module.exports = {verifyToken, isUser, checkRole}