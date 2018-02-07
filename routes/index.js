const express = require('express');
    app = express(),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    expressSession = require('express-session'),
    axios = require('axios'),
    flash = require('connect-flash'),
    passport = require('passport'),    
    bcrypt = require('bcryptjs'),  
    
    helper = require('../helpers/helpers');


app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
// app.use(cookieParser());
// app.use(flash());
// app.use(expressSession({ 
//     secret: process.env.SESSION_SECRET || 'secret',
//     resave: false,
//     saveUninitialized: false
// }))

require('../config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());


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
            console.log(error);
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
    res.render('login', { message: req.flash('loginMessage') });
})

app.post('/login', passport.authenticate('local', { failureFlash: true }), (req, res) => {
    res.redirect('/');
})

app.get('/register', (req, res) => {
    res.render('register', { message: req.flash('signupMessage') });
})

app.post('/register', (req, res) => {
    let newUser = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
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
            res.redirect('/login');
        })
    })
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