const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv');
const path = require('path');
const pagerouter = require('./routes/page');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
require('dotenv').config();
fileUpload = require('express-fileupload'),


dotenv.config({ path: './.env'});

const app = express();



const db= mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

const publicDirectory = path.join(__dirname, 'public');

app.use(express.static(publicDirectory));
app.use(express.urlencoded({extended: false}));

app.use(express.json());
app.use(cookieParser());

//image 
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

db.connect( (error)=>
{
    if(error){
        console.log(error)
    }
    else{
        console.log("mysql connected...")
    }
})


app.use('/', require('./routes/page'));
app.use('/page', pagerouter);




app.listen(5000, ()=>{
    console.log("server started on port 5000");

})
