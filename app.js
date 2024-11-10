const express = require('express');
const morgan = require ('morgan');
const userRoutes = require('./routes/userRoutes')
const cookieParser = require('cookie-parser');
const app = express();

app.use(express.json());

app.use(cookieParser());

if (process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}


app.use((req, res, next) =>{
    req.requestTime = new Date().toISOString();
    next();
});

app.use('/',userRoutes );


module.exports = app;