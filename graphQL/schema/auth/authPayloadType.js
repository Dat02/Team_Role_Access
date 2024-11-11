const {GraphQLObjectType, GraphQLID, GraphQLString, GraphQLNonNull} = require('graphql');
const UserType = require('../user/userType');

const AuthPayloadType = new GraphQLObjectType({
    name: 'AuthPayload',
    fields: () => ({
        token:  {type: GraphQLString},
        user: {type: UserType}
    })
});

module.exports = AuthPayloadType;