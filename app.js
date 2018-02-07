const express = require('express'),
    app = express(),
    morgan = require('morgan'),
    flash = require('connect-flash'),
    cookieParser = require('cookie-parser'),
    expressSession = require('express-session'),
    util = require('util'),

    index = require('./routes/index'),

    PORT = process.env.PORT || 3000;


    app.use(cookieParser());
    app.use(flash());
    app.use(expressSession({ 
        secret: process.env.SESSION_SECRET || 'secret',
        resave: false,
        saveUninitialized: false
    }))


//logger
app.use(morgan('tiny'));

//handle CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, PUT, DELETE');
        return res.status(200).json({});
    }
    next();
});

app.set('view engine', 'ejs')

app.use('/', index);
//app.use('/ticker', ticker)


// catch wrong route error
app.use((req, res, next) => {
    const error = new Error('Wrong page. Not found');
    error.status = 404;
    next(error);
})

app.listen(PORT, () => console.log(`Listening on ${PORT}`));