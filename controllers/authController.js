const GraphQuery = require('../helpers/graphQuery');

class AuthController {
    constructor() {
        this.graphQuery = GraphQuery;
    }

    getAllUser = async(req,res,next) => {
        try {
            const users = await this.graphQuery.getAllUser();
            res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    }

    getUser = async(req,res,next) => {
        try {
            const user  = await this.graphQuery.getUser(req.params.userId);
            res.status(200).json({user});
        } catch (error) {
            next(error);
        }
    }

    getListUser = async(req,res,next) => {
        try {
            console.log('something here');
            const userIds = req.body.userIds;
            console.log(userIds);
            const users = await this.graphQuery.getListUser(userIds);
            res.status(200).json({users});
        } catch (error) {
            next(error);
        }
    }

    register = async(req,res, next) => {
        try {
            const {email,username, password, roleId} = req.body;
            const {token,user} = await this.graphQuery.register({email,password,username,roleId});
            res.cookie('jwt',token);
            res.status(200).json({user});
        } catch (error) {
            next(error);
        }
    }

    logIn = async(req,res, next) => {        

        try {
            const {email, password} = req.body;
            const {token, user} = await this.graphQuery.login({email,password});
            res.cookie('jwt', token);
            res.status(200).json({user});
        } catch (error) {
            next(error);
        }
        
    }

    logOut = async(req,res,next) => {
        try {
            res.clearCookie('jwt');
            res.status(200).json({succcess: true});
        } catch (error) {
            next(error);
        }
    }

}

module.exports  = new AuthController(); 