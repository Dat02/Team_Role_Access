const { validationResult } = require("express-validator");
const { errorHandler } = require("./error");


const inputValidator = (req,res,next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return next(errorHandler(401,'api arguments are not valid', errors.errors));

    next();
}

module.exports = inputValidator;