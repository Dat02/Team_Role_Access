const {GraphQLObjectType, GraphQLID, GraphQLString, GraphQLNonNull} = require('graphql');

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        user_id: {type: GraphQLID},
        user_name: {type: GraphQLString},
        email: {type: GraphQLString},
        password: {type: GraphQLString},
        role_id: {type: GraphQLID}
    })
});



module.exports = UserType;

