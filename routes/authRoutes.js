const mongoose = require('mongoose')
const Utils = require('./utils')
const constants = require('../config/constants')
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const configs = require('../config/config');

var userAuth = null;
var storeAuth = null;

passport.use(new GoogleStrategy({
  clientID: configs.GOOGLE_CLIENT_ID,
  clientSecret: configs.GOOGLE_CLIENT_SECRET,
  callbackURL: `${configs.SERVER_URL}/auth/google/callback`,
  accessType: 'offline'
}, (accessToken, refreshToken, profile, cb) => {
  // Extract the minimal profile information we need from the profile object
  // provided by Google
  cb(null, extractProfile(profile, 'google'));
}));



passport.use(new FacebookStrategy({
    clientID: configs.FACEBOOK_APP_ID,
    clientSecret: configs.FACEBOOK_CLIENT_SECRET,
    callbackURL: `${configs.SERVER_URL}/auth/facebook/callback`,
    profileFields: ['id', 'displayName', 'photos', 'email']
  },
  function(accessToken, refreshToken, profile, done) {
    done(null, extractProfile(profile, 'facebook'));
  }
));

passport.use(new LocalStrategy(
  function(username, password, done) {
    //TODO find user in database here and store in a user obnject
    return done(null, user)
  }
))

function done(user) {
  //TODO callback for when authentication is done
}


function extractProfile (profile, provider) {
  let imageUrl = '';
  let email = profile.emails[0].value;;
  let names = profile.displayName.split(" ");
  if (profile.photos && profile.photos.length) {
    imageUrl = profile.photos[0].value;
  }
  return {
    id: profile.id,
    firstName: names[0],
    lastName: names[1],
    email,
    image: imageUrl
  };
}


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

    newObj.save((err, result) => Utils.callBack(res, err, result));
  });

  // Read
  app.get('/auth', function(req, res) {
    const jsonData = req.body;

    if (jsonData["collection"] === constants.USERS) {
      userAuth.findById(jsonData.id, (err, result) => Utils.callBack(res, err, result));
    } else if (jsonData["collection"] === constants.STORES) {
      storeAuth.findById(jsonData.id, (err, result) => Utils.callBack(res, err, result));
    }
  });


  // Call to Google oAuth2 API
  app.get('/auth/login/google', (req, res, next) => {
      if (req.query.return) {
        req.session.oauth2return = req.query.return;
      }
      next();
    },
    passport.authenticate('google', { scope: ['email', 'profile'] })
  );

  // Call to Facebook's oAuth API
  app.get('/auth/login/facebook', (req,res,next) => {
    if (req.query.return) {
      req.session.oauth2return = req.query.return;
    }
    next();
  },
    passport.authenticate('facebook', { scope: ['email'] })
  );

  // redirect route for when google sucessfully authenticates user
  app.get('/auth/google/callback',
    // Finish OAuth 2 flow using Passport.js
    passport.authenticate('google'),
    // Redirect back to the original page, if any
    // User information is stored in req.user and information is taken from extractProfile
    (req, res) => {
      // Check to see if user exist in database
      // If not, create and return the new userID
      // If yes, return userID
      const query = Utils.usersQuery(req.user)
      const redirect = req.session.oauth2return || '/user?';
      delete req.session.oauth2return


      User.findOne(query, function(err, result) {
        // If result exists, return that userID
        // If result doesn't exist, create user and return newID
        if (result) {
          Utils.redirectCallback(res, redirect, result.id)
        } else {
          const newUser = Utils.createUser(User, query);
          newUser.save((err, result) => Utils.redirectCallback(res, redirect, result.id));
        }
      });
    }
  );
  // redirect route for when facebook sucessfully authenticates user
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook',  { failureRedirect: '/loginError' }),
    (req,res) => {
      // Check to see if user exist in database
      // If not, create and return the new userID
      // If yes, return userID
       //HERE IS YOUR USER DATA

      const query = Utils.usersQuery(req.user)
      const redirect = req.session.oauth2return || '/user?';
      delete req.session.oauth2return;
      User.findOne(query, function(err, result) {
        // If result exists, return that userID
        // If result doesn't exist, create user and return newID
        if (result) {
          Utils.redirectCallback(res, redirect, result.id)
        } else {
          const newUser = Utils.createUser(User, query);
          newUser.save((err, result) => Utils.redirectCallback(res, redirect, result.id));
        }
      });
    }
  )

  app.get('/auth/login/email',
    passport.authenticate('local', { failureRedirect: '/loginError' }),
    (req,res) => {
      // Check to see if user exist in database
      // If not, create and return the new userID
      // If yes, return userID
      console.log(req) //HERE IS YOUR USER DATA

      const query = Utils.usersQuery(req)
      const redirect = req.session.oauth2return || '/user?';
      delete req.session.oauth2return;

      User.findOne(query, function(err, result) {
        // If result exists, return that userID
        // If result doesn't exist, create user and return newID
        if (result) {
          Utils.redirectCallback(res, redirect, result.id)
        } else {
          const newUser = Utils.createUser(query);
          newUser.save((err, result) => Utils.redirectCallback(res, redirect, result.id));
        }
      });
    }
  )

  app.get('/loginError', (req,res) => {
    res.redirect(configs.CLIENT_URL);
  })


  passport.serializeUser((user, cb) => {
    cb(null, user);
  });
  passport.deserializeUser((obj, cb) => {
    cb(null, obj);
  });



  // Update
  app.put('/auth/login/email', function(req, res) {
    const jsonData = req.body.params;

    var update =
    {
      role: jsonData.role,
      password: jsonData.password
    };

    if (!(Utils.isValidObjectId(jsonData.id))) {
      res.send(constants.ID_ERROR);
      return;
    }

    if (jsonData["collection"] === constants.USERS) {
      userAuth.findByIdAndUpdate(jsonData.id, update, (err, result) => Utils.putCallback(res, err, result));
    } else if (jsonData["collection"] === constants.STORES) {
      storeAuth.findByIdAndUpdate(jsonData.id, update, (err, result) => Utils.putCallback(res, err, result));
    }
  });

  // delete
  app.delete('/auth', function(req, res) {
    const jsonData = req.body;

    if (jsonData["collection"] === constants.USERS) {
      userAuth.findByIdAndDelete(jsonData.id, (err, result) => Utils.callBack(res, err, result));
    } else if (jsonData["collection"] === constants.STORES) {
      storeAuth.findByIdAndDelete(jsonData.id, (err, result) => Utils.callBack(res, err, result));
    }
  });
};
