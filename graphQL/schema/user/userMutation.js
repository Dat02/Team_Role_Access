const {GraphQLObjectType, GraphQLID, GraphQLString, GraphQLNonNull, GraphQLList} = require('graphql');
const UserResolver = require('../../resolvers/user/userResolver');

const AuthPayloadType = require('../auth/authPayloadType');
const UserType = require('./userType');

const register = {
    type: AuthPayloadType,
    args: {
        username: {
            type: new GraphQLNonNull(GraphQLString)
        },
        email: {
          type: new GraphQLNonNull(GraphQLString)  
        },
        password: {
            type: new GraphQLNonNull(GraphQLString)
        },
        roleId: {
            type: new GraphQLNonNull(GraphQLID)
        }
    },
    resolve: async(parent, {username, email, password, roleId}, {req,res} ) => {
        const {user, token} = await UserResolver.register({username, email, password, roleId});
        res.cookie('jwt', token);
        return {user,token};
    }
}

const login = {
    type: AuthPayloadType,
    args: {
        email: {
          type: new GraphQLNonNull(GraphQLString)  
        },
        password: {
            type: new GraphQLNonNull(GraphQLString)
        }
    },
    resolve: async(parent, {email, password}, {req,res} ) => {
        const {user, token} = await UserResolver.login({email, password});
        res.cookie('jwt', token);
        return {user,token};
    }
}

const update = {
    type: UserType,
    args: {
        id: {
            type: new GraphQLNonNull(GraphQLID)
        },
        username: {
            type: GraphQLString
        },
        email: {
          type: GraphQLString
        },
        password: {
            type: GraphQLString
        }, 

    },
    resolve: async(parent, {id, email, username, password}, {req,res} ) => {
        
        const user = req.user;
        const updatedUser = await UserResolver.update({user,id,email, username,password});
        return updatedUser;
    }
}

const deleteUser = {
    type: UserType,
    args: {
        id: {
            type: new GraphQLNonNull(GraphQLID)
        }
    },
    resolve: async(parent, {id}, {req,res} ) => {
        const user = req.user;
        const deletedUser = await UserResolver.remove({user, userId: id});
        return deletedUser;
    }
}


module.exports = {register, login, update, deleteUser}