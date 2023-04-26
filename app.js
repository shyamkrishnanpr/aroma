const express = require('express');
const app = express();
const path = require('path');
const session =require('express-session');
const bodyParser = require("body-parser");
const cookieparser = require("cookie-parser");
const dbconnect = require('./config/connection')
const dotenv = require('dotenv');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const { cookie } = require('express-validator');
var fs = require('fs');
// const morgan = require('morgan')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

//  app.use(morgan('dev'));

// const smtpEmail = process.env.SMTP_EMAIL;
// const smtpPassword = process.env.SMTP_PASSWORD

dotenv.config();
dbconnect.dbconnect();

app.use(session({
    secret : 'secret-key',
    saveUninitialized : true,
    resave : false,
    cookie: { maxAge:1000000}
}))


app.use(express.static('public',{'extensions':['html','css']}));

app.use('/public',express.static(path.join(__dirname,'public/css')));
app.use(express.static(path.join(__dirname,'public')));
app.use('/img',express.static(path.join(__dirname,'public/img')));

app.set('view engine', 'ejs');

app.use(cookieparser());



app.use((req, res, next) => {
    res.set('cache-control', "no-cache,private,no-store,must-revalidate,max-stable=0,post-check=0,precheck=0")
    next()
})


app.use('/', userRouter);

app.use('/admin', adminRouter)

var port =process.env.PORT || 3000;

app.listen(3000,function(){
    console.log("server is listening")
})

