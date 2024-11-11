const {GraphQLObjectType, GraphQLID, GraphQLString, GraphQLNonNull, GraphQLList} = require('graphql');
const UserResolver = require('../../resolvers/user/userResolver');
const UserType = require('./userType');

const users = {
    type: new GraphQLList(UserType),
    resolve: async () => {
        const users = await UserResolver.getAllUsers();
        return users;
    }
}

const user = {
    type: UserType,
    args: {id: {type: GraphQLID}},
    resolve: async (parent, arg) => {
        const userId = arg.id;
        const user =  await UserResolver.getUser(userId);
        return user;
    }
}

const me = {
    type: UserType,
    resolve: async (parent,args,{req,res}) => {
        if(!req.user) throw new Error('not yet login');
        console.log(req.user);
        const userId = req.user.userId;
        return await UserResolver.getUser(userId);
    }
}



module.exports = {users,user, me};
