var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { MongoClient } = require('mongodb');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

const mongoClient = require('mongodb').MongoClient;
mongoClient.connect("mongodb://127.0.0.1:27017")
.then(client => {
    console.log("Nu är du uppkopplad mot databasen");

    const db = client.db("marcus-yttermyr");
    app.locals.db = db;
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/users', usersRouter);

module.exports = app;
