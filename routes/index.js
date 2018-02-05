const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const axios = require('axios');
const fs = require('fs');
const flash = require('connect-flash');
const path = require('path');

const passport = require('passport');
const bcrypt = require('bcryptjs');


const DATA_FILEPATH = path.join(__dirname, '../data/data.json');
const USERS_FILEPATH = path.join(__dirname, '../data/users.json');
const url = 'https://www.bitstamp.net/api/ticker/';
const url2 = 'https://www.bitstamp.net/api/v2/ticker/ethusd';

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressSession({ 
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false
}))
app.use(flash());
require('../config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

function getData(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }
  
function saveData(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function getItemByTime(collection, time) {
    let correctedTime = time - 500;
    return collection.find((item) => {
        return item['bitcoin'].timestamp >= correctedTime && item.timestamp <= time
    });
}


app.get('/', (req, res) => {

    const getRate = async url => {
        try {
            const response = await axios.get(url);
            const response2 = await axios.get(url2);

            const data = response.data;
            const data2 = response2.data;

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
              const collection = [...getData(DATA_FILEPATH)];
              collection.push(obj)
              saveData(DATA_FILEPATH, collection)
        } catch(error) {
            console.log(error);
        }
    }
setInterval(getRate.bind(null, url), 10*1000);
getRate(url)

    res.render('index', {
        isAuthenticated: req.isAuthenticated(),
        user: req.user
    })

})

app.get('/ticker', (req, res) => {
    const getRate = async url => {
        try {
            const response = await axios.get(url);
            const response2 = await axios.get(url2);
            const data = response.data;
            const data2 = response2.data;
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
    getRate(url);
})

app.get('/ticker5min', (req, res) => {
    let dateNow = Date.now().toString().slice(0, -3);
    const collection = [...getData(DATA_FILEPATH)];
    const last5mins = getItemByTime(collection, dateNow);

    const getRate = async url => {
        try {
            const response = await axios.get(url);
            const data = response.data;
            let objToRender = {};
            objToRender.current_rate = data.last;
            objToRender.rate_5min = last5mins.current_rate;
            res.json(objToRender)
            res.end()
        } catch(error) {
            console.log(error);
        }
    }
    getRate(url)
})

app.get('/advisor', hasAccess, (req, res) => {
    res.send('Advisor page')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', passport.authenticate('local'), (req, res) => {
    res.redirect('/');
})

app.get('/register', (req, res) => {
    res.render('register')
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
            const collection = [...getData(USERS_FILEPATH)]
            collection.push(newUser)
            saveData(USERS_FILEPATH, collection)
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
