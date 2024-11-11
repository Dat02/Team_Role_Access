const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { verifyToken } = require('./middlewares/auth');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const graphQlSchema = require('./schema');

require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log('Server is running');
})



app.use('/graphql', verifyToken, graphqlHTTP((req,res) => ({
    graphiql: true,
    schema: graphQlSchema,
    context: {req,res}
})));




app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
});
