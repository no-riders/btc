const passport = require('passport');
const passportLocal = require('passport-local').Strategy;
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const USERS_FILEPATH = path.join(__dirname, '../data/users.json');

function getData(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }
  
function saveData(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}



module.exports = (passport) => {
    //Local Strategy
    passport.use(new passportLocal.Strategy((username, password, done) => {
        //this would be stored to database, salted and hashed. For this test app, I will simplify
        const collection = [...getData(USERS_FILEPATH)];
        let userMatch = collection.find(user => {
            user.username = username
        })
        if (!userMatch) {
            done(null, false, { message: 'No user found' })
        }

        //Match password
        bcrypt.compare(password, userMatch.password, (err, isMatch) => {
            if(err) throw err;
            if(isMatch) {
                return done(null, user)
            } else {
                done(null, false, { message: 'Password does not match' })
            }
        });
    }));
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
}