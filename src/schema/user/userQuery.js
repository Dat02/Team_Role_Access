const {GraphQLObjectType, GraphQLID, GraphQLString, GraphQLNonNull, GraphQLList} = require('graphql');
const UserResolver = require('../../resolvers/user/userResolver');
const UserType = require('./userType');

const users = {
    type: new GraphQLList(UserType),
    resolve: async () => {
        return await UserResolver.getAllUsers();
    }
}

const user = {
    type: UserType,
    args: {id: {type: GraphQLID}},
    resolve: async (parent, arg) => {
        const userId = arg.id;
        return await UserResolver.getUser(userId);
    }

}

module.exports = {users,user};
