const express = require('express');
    app = express(),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    expressSession = require('express-session'),
    axios = require('axios'),
    flash = require('connect-flash'),
    passport = require('passport'),    
    bcrypt = require('bcryptjs'),  
    uncaught = require('uncaught'),


    helper = require('../helpers/helpers');
    

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
// app.use(cookieParser());
// app.use(expressSession({ 
//     secret: process.env.SESSION_SECRET || 'secret',
//     resave: false,
//     saveUninitialized: false
// }))

// require('../config/passport')(passport);

// app.use(passport.initialize());
// app.use(passport.session());
// app.use(flash());

//promise rej err handling
uncaught.start();
uncaught.addListener(function (error) {
    console.log('Uncaught error or rejection: ', error.message);
});

app.get('/', (req, res) => {
    const getRate = async (url, url2) => {

        try {
            const response = await axios.get(url),
                response2 = await axios.get(url2),

                data = response.data,
                data2 = response2.data;

            let obj = {};
            if (!data) {
                return null;
              }
              obj.bitcoin = {
                  current_rate: data.last,
                  timestamp: data.timestamp
              }
            obj.ethereum = {
                current_rate: data2.last,
                timestamp: data2.timestamp
            }
              const collection = [...helper.getData(helper.DATA_FILEPATH)];
              collection.push(obj)
              helper.saveData(helper.DATA_FILEPATH, collection)
        } catch(error) {
            throw new Error
            //console.log('!!!!', error);
        }
    }
setInterval(getRate.bind(null, helper.url), 10*1000);
getRate(helper.url, helper.url2)

    res.render('index', {
        isAuthenticated: req.isAuthenticated(),
        user: req.user
    })

})

app.get('/ticker', (req, res) => {
    const getRate = async (url, url2) => {
        try {
            const response = await axios.get(url),
                response2 = await axios.get(url2),
                data = response.data,
                data2 = response2.data;
            res.json({
                bitcoin: {
                    current_rate: data.last
                },
                ethereum: {
                    current_rate: data2.last
                }
            })
            res.end()
        } catch(error) {
            console.log(error);
        }
    }
    getRate(helper.url, helper.url2);
})

app.get('/ticker5min', (req, res) => {
    let dateNow = Date.now().toString().slice(0, -3),
        collection = [...helper.getData(helper.DATA_FILEPATH)],
        last5mins = helper.getItemByTime(collection, dateNow);

    const getRate = async url => {
        try {
            const response = await axios.get(url),
                data = response.data;
            let objToRender = {};
            objToRender.current_rate = data.last;
            objToRender.rate_5min = last5mins.current_rate;
            res.json(objToRender)
            res.end()
        } catch(error) {
            console.log(error);
        }
    }
    getRate(helper.url)
})

app.get('/advisor', hasAccess, (req, res) => {
    res.send('Advisor page')
})

app.get('/login', (req, res) => {
    res.render('login');
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', (req, res) => {
    const name = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const password2 = req.body.password2;

    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(password);

    let errors = req.validationErrors();
    if (errors) {
        res.render('register', {
            errors: errors
        })
    } else {
        let newUser = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            password2: req.body.password2
        }

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if(err) {
                        console.log(err)
                    }
                    newUser.password = hash;
                    const collection = [...helper.getData(helper.USERS_FILEPATH)]
                    collection.push(newUser)
                    helper.saveData(helper.USERS_FILEPATH, collection)
                    req.flash('success', 'Successfully registered, please log in')
                    res.redirect('/login');
                })
            })
    }
})

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
})

function hasAccess(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    } else {
        res.redirect('/login')
    }
}




module.exports = app;