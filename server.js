const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

//route to services
const teamRouter = require('./routes/teamRouter');
const authRouter = require('./routes/authRouter');

//
const {verifyToken, isUser} = require('./middlewares/auth');


const app = express();

app.use(express.json());
app.use(cookieParser());



const PORT = process.env.PORT || 4000;
app.listen(process.env.PORT, () => {console.log(`server is running ${PORT}`);});

app.use('/', authRouter);
app.use('/teams', verifyToken, teamRouter);


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

