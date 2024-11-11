const {GraphQLObjectType, GraphQLID, GraphQLString, GraphQLNonNull} = require('graphql');

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: {type: GraphQLID},
        username: {type: GraphQLString},
        email: {type: GraphQLString},
        password: {type: GraphQLString}
    })
});



module.exports = UserType;

