const express = require('express');
    app = express(),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    expressSession = require('express-session'),
    axios = require('axios'),
    flash = require('connect-flash'),
    passport = require('passport'),    
    bcrypt = require('bcryptjs')


    helper = require('../helpers/helpers');
    

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    helper.getRate(helper.url, helper.url2, 'loop')

    let bound = helper.getRate.bind(null, helper.url, helper.url2, 'loop')
    setInterval(bound, 10*1000);

    res.render('index', {
        isAuthenticated: req.isAuthenticated(),
        user: req.user
    })
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
            password: req.body.password
        }
    helper.bcryptPass(newUser, req, res)
    }
})

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
})

app.get('/ticker', (req, res) => {
    let currRate = helper.getRate(helper.url, helper.url2)
        .then(item => {
                res.json({
            bitcoin: {
                current_rate: item.data.last
            },
            ethereum: {
                current_rate: item.data2.last
            }
        })
    })
})

app.get('/ticker5min', (req, res) => {
    let dateNow = Date.now().toString().slice(0, -3),
        collection = [...helper.getData(helper.DATA_FILEPATH)],
        last5mins = helper.getItemByTime(collection, dateNow);
        console.log(typeof last5mins);
        helper.getRate(helper.url, helper.url2)
          .then(item => {
            res.json({
              bitcoin: {
                current_rate: item.data.last,
                rate5min: last5mins["bitcoin"].current_rate
              },
              ethereum: {
                current_rate: item.data2.last,
                rate5min: last5mins["ethereum"].current_rate
              }
            });
          });
})

app.get('/advisor', hasAccess, (req, res) => {
    res.send('Advisor page')
})

function hasAccess(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    } else {
        res.redirect('/login')
    }
  }


module.exports = app;