
const knex = require('../../../config/dbConfig')
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UserResolver{

    constructor() {
        this.db = knex;
    }

    getAllUsers = async() => {
        const users =  await this.db('users').select('*').returning('*');
        return users;
    }

    getUser = async(userId) => {
        const users = await this.db('users').select('*').where('user_id', userId);
        const user = users[0];
        return user;
    }

    register = async({username, email, password,roleId}) => {
        const userWithEmail = await this.db('users').select('user_id').where('email', email);
        if(userWithEmail.length > 0) throw new Error ('Email is registered before!');

        const hashPassword = bcryptjs.hashSync(password);
        const insertedUsers = await this.db('users').insert({user_name: username, email, 'password': hashPassword, role_id: roleId}).returning('*');
        const newUser = insertedUsers[0];

        const userNoPassword = this.extractUserData(newUser);
        const token = jwt.sign(userNoPassword, process.env.ACCESS_TOKEN_SECRETE, {expiresIn: '30m'});
        // console.log('...', token);

        return {
            user: userNoPassword,
            token
        }

    }


    login = async({email, password}) =>  {
        const user = await this.db('users').select('*').where('email', email).first();
        if(!user) throw new Error('email is not found');

        const validPassword = bcryptjs.compareSync(password, user.password);
        if(!validPassword) throw new Error('password is incorrect');

        const userNoPassword = this.extractUserData(user);
        const token = jwt.sign(userNoPassword, process.env.ACCESS_TOKEN_SECRETE, {expiresIn: '30m'});

        return {
            user: userNoPassword,
            token
        };
    }

    update = async ({user, id, username, email, password}) => {

        if(!user) throw new Error('not authenicated');

        if(user.id != id) throw new Error ('only update your profile');

        const hashPassword = bcryptjs.hashSync(password);

        await this.db('users').where({id}).update({user_name: username, email, password: hashPassword});

        const updatedUser = await this.db('users').select('*').where({id}).first();
        return updatedUser;

    }

    remove = async ({user, userId}) => {
        if(!user) throw new Error('not authenicated');

        if(user.id != userId) throw new Error ('only delete your profile');

        const deletedUser  =  await this.getUser(userId);

        await this.db('users').where('id',userId).delete();

        return deletedUser;
    }

    extractUserData(user) {
        return {
            user_id: user.user_id,
            user_name: user.user_name,
            email: user.email,
            role_id: user.role_id
        }
    }

}

module.exports = new UserResolver();
