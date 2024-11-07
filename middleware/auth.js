
const {errorHandler} = require('./error');
const jwt = require('jsonwebtoken');


exports.verifyToken = (req,res,next) => {
    const token = req.cookies.jwt;
    if(!token) return next(errorHandler(401, 'not authenicated'));

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE, (err, user) => {
        if(err) return next(errorHandler(403, 'wrong credential'));
        req.user = user;
        next();
    })
}


exports.checkRole = (assign) => {

    return (req,res,next) => {

        const role = req.user.role_id;
        if(!role) return next(errorHandler(401, 'not authenicated'));
        if(role != assign) return next(errorHandler(404, 'Access denied'));

        next();
    }
}