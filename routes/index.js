const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const passport = require('passport');
const passportLocal = require('passport-local');
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

app.use(passport.initialize());
app.use(passport.session());

//configure local strategy
passport.use(new passportLocal.Strategy((username, password, done) => {
    //this would be stored to database, salted and hashed. For this test app, I will simplify

    if (username === password) {
        done(null, {
            id: username,
            name: username
        });
    } else {
        done(null, null)
    }
}))

passport.serializeUser((user, done) => {
    done(null, user.id);
})

passport.deserializeUser((id, done) => {
    //db query or cash in real-world app
    done(null, {
        id,
        name: id
    })

})

function getData() {
    return JSON.parse(fs.readFileSync(DATA_FILEPATH, "utf-8"));
  }
  
function saveData(data) {
    fs.writeFileSync(DATA_FILEPATH, JSON.stringify(data, null, 2));
}

function getItemByTime(collection, time) {
    let correctedTime = time - 300;
    return collection.find((item) => {
        return item.timestamp >= correctedTime && item.timestamp <= time
    });
}


app.get('/',(req, res) => {

    res.render('index', {
        isAuthenticated: req.isAuthenticated(),
        user: req.user
    })
//     const getRate = async url => {
//         try {
//             const response = await axios.get(url);
//             const response2 = await axios.get(url2);

//             const data = response.data;
//             const data2 = response2.data;

//             let obj = {};
//             if (!data) {
//                 return null;
//               }
//               obj.bitcoin = {
//                   current_rate: data.last,
//                   timestamp: data.timestamp
//               }
//             obj.ethereum = {
//                 current_rate: data2.last,
//                 timestamp: data2.timestamp
//             }
//               const collection = [...getData()];
//               collection.push(obj)
//               saveData(collection)
//         } catch(error) {
//             console.log(error);
//         }
//     }
// setInterval(getRate.bind(null, url), 10*1000);
// getRate(url)
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
            fs.writeFileSync(USERS_FILEPATH, JSON.stringify(newUser, null, 2));
            res.redirect('/login');
        })
    })
})

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
})

app.get('/ticker5min', (req, res) => {
    let dateNow = Date.now().toString().slice(0, -3);
    const collection = [...getData()];
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



module.exports = app;
