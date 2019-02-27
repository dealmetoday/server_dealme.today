const passport = require('passport');
const mongoose = require('mongoose')
const Misc = require('../utils/misc')
const cb = require('../utils/callbacks')
const configs = require('../config/config');
const Security = require('../utils/security');
const constants = require('../config/constants');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local').Strategy;

var userAuth = null;
var storeAuth = null;

passport.use(new LocalStrategy(
  function(username, password, done) {
    //TODO find user in database here and store in a user obnject
    return done(null, user)
  }
))

module.exports = function(app, authDB, usersDB) {
  // Setting constructors
  userAuth = authDB.UserAuths;
  storeAuth = authDB.StoreAuths;
  User = usersDB.Users;

  // Create
  app.post('/auth', function(req, res) {
    const jsonData = req.body;

    var newObj = null;

    if (jsonData["collection"] === constants.USERS) {
      newObj = new userAuth(
        {
        _id: jsonData.id,
        role: jsonData.role,
        password: jsonData.password
      });
    } else if (jsonData["collection"] === constants.STORES) {
      newObj = new storeAuth(
        {
        _id: jsonData.id,
        role: jsonData.role,
        password: jsonData.password
      });
    }

    newObj.save((err, result) => cb.regCallback(res, err, result));
  });

  // Read
  app.get('/auth', function(req, res) {
    const jsonData = req.body;

    if (jsonData["collection"] === constants.USERS) {
      userAuth.findById(jsonData.id, (err, result) => cb.regCallback(res, err, result));
    } else if (jsonData["collection"] === constants.STORES) {
      storeAuth.findById(jsonData.id, (err, result) => cb.regCallback(res, err, result));
    }
  });

  app.get('/auth/login/email',
    passport.authenticate('local', { failureRedirect: '/loginError' }),
    (req,res) => {
      // Check to see if user exist in database
      // If not, create and return the new userID
      // If yes, return userID
      console.log(req) //HERE IS YOUR USER DATA

      const query = Misc.usersQuery(req)
      const redirect = req.session.oauth2return || '/user?';
      delete req.session.oauth2return;

      User.findOne(query, function(err, result) {
        // If result exists, return that userID
        // If result doesn't exist, create user and return newID
        if (result) {
          cb.redirectCallback(res, redirect, result.id)
        } else {
          const newUser = Misc.createUser(query);
          newUser.save((err, result) => cb.redirectCallback(res, redirect, result.id));
        }
      });
    }
  )

  app.get('/loginError', (req,res) => {
    res.redirect(configs.CLIENT_URL);
  })

  passport.serializeUser((user, callback) => {
    callback(null, user);
  });

  passport.deserializeUser((obj, callback) => {
    callback(null, obj);
  });

  // Update
  app.put('/auth/login/email', function(req, res) {
    const jsonData = req.body.params;

    var update =
    {
      role: jsonData.role,
      password: jsonData.password
    };

    if (!(Misc.isValidObjectId(jsonData.id))) {
      res.send(constants.ID_ERROR);
      return;
    }

    if (jsonData["collection"] === constants.USERS) {
      userAuth.findByIdAndUpdate(jsonData.id, update, (err, result) => cb.putCallback(res, err, result));
    } else if (jsonData["collection"] === constants.STORES) {
      storeAuth.findByIdAndUpdate(jsonData.id, update, (err, result) => cb.putCallback(res, err, result));
    }
  });

  // delete
  app.delete('/auth', function(req, res) {
    const jsonData = req.body;

    if (jsonData["collection"] === constants.USERS) {
      userAuth.findByIdAndDelete(jsonData.id, (err, result) => cb.regCallback(res, err, result));
    } else if (jsonData["collection"] === constants.STORES) {
      storeAuth.findByIdAndDelete(jsonData.id, (err, result) => cb.regCallback(res, err, result));
    }
  });

  // tests
  app.get('/authTests', function(req, res) {
    result = {};

    let password = "my name is jeff";

    let ePw = Security.encrypt(password);
    let dPw = Security.decrypt(ePw);

    if (password.localeCompare(dPw) == 0) {
      result.encryption = "Encryption works :)"
    }  else {
      result.encryption = "Encryption doesn't works :("
    }

    let hashed = Security.hashPassword(password);
    hashed.then((data) => {
      console.log("Hashed Password: " + hashed);
    })

    let verifyResult = Security.verifyPassword(User, userAuth, 'mihailo@shaw.ca', password);
    if (verifyResult) {
      result.verify = "yessir";
    } else {
      result.verify = "No ma'am :(";
    }

    res.send(result);
  });
};
