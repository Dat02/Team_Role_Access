const { GraphQLObjectType, GraphQLSchema } = require("graphql");
const userMutation = require("./user/userMutation");
const userQuery = require('./user/userQuery');

const Query = new GraphQLObjectType({
    name: 'Query',
    fields: {
        users: userQuery.users,
        user: userQuery.user
    }
});

const Mutaion = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        register: userMutation.register,
        login: userMutation.login,
        update: userMutation.update,
        delete: userMutation.deleteUser
    }
});

const schema = new GraphQLSchema({
    query: Query,
    mutation: Mutaion,
});

module.exports = schema;