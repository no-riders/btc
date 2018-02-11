const express = require('express'),
    app = express(),
    morgan = require('morgan'),
    flash = require('connect-flash'),
    cookieParser = require('cookie-parser'),
    expressSession = require('express-session'),
    passport = require('passport'),    
    bcrypt = require('bcryptjs'),
    expressValidator = require('express-validator'),

    PORT = process.env.PORT || 3001;

    app.use(morgan('tiny'));

    app.use(cookieParser());
    app.use(expressSession({ 
        secret: process.env.SESSION_SECRET || 'secret',
        resave: true,
        saveUninitialized: true
    }))

    app.use(flash());
    app.use((req, res, next) => {
        res.locals.messages = require('express-messages')(req, res);
        next();
    })

    //validator
    app.use(expressValidator({
        errorFormatter: (param, msg, value) => {
            let namespace = param.split('.'),
                root = namespace.shift(),
                formParam = root;

            while (namespace.length) {
                formParam += '[' + namespace.shift() + ']';
            }
            return {
                param: formParam,
                msg,
                value
            }
        }
    }))

    require('./config/passport')(passport);
    
    app.use(passport.initialize());
    app.use(passport.session());

const routes = require('./routes/index')

//handle CORS
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
//     if (req.method === 'OPTIONS') {
//         res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, PUT, DELETE');
//         return res.status(200).json({});
//     }
//     next();
// });

app.set('view engine', 'ejs')

app.use('/', routes);


// catch wrong route error
app.use((req, res, next) => {
    res.render('404')
})

app.listen(PORT, () => console.log(`Listening on ${PORT}`));