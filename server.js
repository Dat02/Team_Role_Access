const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { graphqlHTTP } = require('express-graphql');
require('dotenv').config();

//route to services
const teamRouter = require('./routes/teamRouter');

//
const {verifyToken, isUser} = require('./middleware/auth');

const graphQlSchema = require('./graphQL/schema/index');

const app = express();

app.use(express.json());
app.use(cookieParser());


app.listen(process.env.PORT, () => {console.log('server is running');});

app.use('/graphql', isUser, graphqlHTTP((req,res) => ({
    graphiql: true,
    schema: graphQlSchema,
    context: {req,res}
})));

app.use('/teams', verifyToken,teamRouter);


app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors;
  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
    errors
  });
});


module.exports = app;
