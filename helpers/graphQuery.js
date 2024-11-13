const {request, gql } = require("graphql-request");
const  endpoint = process.env.GRAPH_SERVER_URI;


class GraphQuery {


    getAllUser = async () => 

    {
        const query =  gql `
            query getAllUser {
                users {
                    user_id,
                    user_name,
                    email,
                    password,
                    role_id
                }
            }
        `;

        const response = await request(endpoint, query);
        return response.users;
    }

    login = async ({email,password}) => {
        // console.log(email, password);
        const query = gql `
            mutation Login($email: String!, $password: String!){
                login(email: $email, password: $password){
                    token,
                    user {
                        user_id,
                        user_name,
                        email
                    }
                }
            }
        `;

        const response = await request(endpoint,query, {email,password});
        return response.login;
    }

    register = async ({email,password,username,roleId}) => {
        console.log(email,password,username,roleId);
        const query = gql `
            mutation Register($email: String!, $password: String!, $username: String!, $roleId: ID!) {
                register(email: $email, password: $password, username: $username, roleId: $roleId){
                    token,
                    user{
                        user_id,
                        user_name,
                        email
                    }
                }
            }
        `;
        const response = await request(endpoint, query, {email,password,username,roleId});
        return response.register;
    }

}

module.exports = new GraphQuery();