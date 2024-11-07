const db = require('../config/dbConfig');
const { errorHandler } = require('../middleware/error');

class UserService {

    constructor () {
        this.db = db;
    }

    async serchUserbyUserName({user_name}) {
        const user = await this.db('users').select('*').where({user_name});
        return user[0];
    }

    async findAll() {
        return await this.db('users').select('*');
    }

    async create(user) {
        const {username, password, role_id} = user;
        const newUser = await this.db('users').insert({user_name: username,password,role_id}).returning('*');
        return newUser;
    }

}

module.exports = new UserService();