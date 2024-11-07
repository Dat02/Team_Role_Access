const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

//route to services
const userRouter = require('./routes/userRouter');
const teamRouter = require('./routes/teamRouter');

//
const {verifyToken} = require('./middleware/auth');


const app = express();

app.use(express.json());
app.use(cookieParser());


app.listen(process.env.PORT, () => {console.log('server is running');});

app.use('/users', userRouter);
app.use('/teams', verifyToken,teamRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
});


module.exports = app;
