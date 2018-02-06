const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const helper = require('../helpers/helpers');


module.exports = (passport) => {
    //Local Strategy
    passport.use(new LocalStrategy((username, password, done) => {
        //this would be stored to database, salted and hashed. For this test app, I will simplify
        const collection = [...helper.getData(helper.USERS_FILEPATH)];
        let userMatch = collection.find(user => {
            return user.username === username
        })
        if (!userMatch) {
            done(null, false, { message: 'No user found' })
        }

        //Match password
        bcrypt.compare(password, userMatch.password, (err, isMatch) => {
            if(err) throw err;
            if(isMatch) {
                return done(null, userMatch)
            } else {
                done(null, false, { message: 'Password does not match' })
            }
        });
    }));
    
    passport.serializeUser((user, done) => {
        done(null, user);
    })
    
    passport.deserializeUser((user, done) => {
        //db query or cash in real-world app
        // let userMatch = collection.find(user => {
        //     user.username = username
        // })
        done(null, user)
    
    })
}