const express = require('express');
const morgan = require ('morgan');
const userRoutes = require('./routes/userRoutes')
const eventsRoutes = require('./routes/eventRoutes');
const purchasRouter = require('./routes/purchasRoutes')
const adminRoutes = require('./routes/adminRoutes');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(cors({origin: "http://localhost:5173", credentials:true}));
if (process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}
 

app.use((req, res, next) =>{
    req.requestTime = new Date().toISOString();
    next();
});

app.use('/',userRoutes );
app.use('/',eventsRoutes);
app.use('/',purchasRouter);
app.use('/',adminRoutes);


module.exports = app;