
const { errorHandler } = require('../middleware/error');
const UserService = require('../services/userService');
const jwt = require('jsonwebtoken');

class UserController {

    constructor () {
        this.userService = UserService;
    }

    getAll = async (req,res,next) => {
        try {
            const users = await this.userService.findAll();
            res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    }

    getUser = async (req,res,next) => {

        try {
            const userId = req.params.userId;
            const user = await this.userService.find({userId});
            res.status(200).json({user});
        } catch (error) {
            next(error);
        }

    }

    createUser = async (req,res,next) => {
        try {
            const user = req.body;
            const new_user = await this.userService.create(user);
            res.status(200).json({new_user});
        } catch (error) {
            next(error);
        }
    }

    login = async (req,res,next) => {
        try {
            const user_name = req.body.username;
            const password = req.body.password;
            console.log(user_name, password);

            if(!user_name) return next(errorHandler(401,'user field is required'));
            const user = await this.userService.searchUserbyUserName({user_name});
            console.log(user);

            if(!user) return next(errorHandler(401, 'user not found'));
            if(password != user.password) return next(errorHandler(403, 'wrong password'));

            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRETE);
            res.cookie('jwt', token);

            res.status(200).json({token});

        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();

