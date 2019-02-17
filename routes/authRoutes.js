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

passport.use(new GoogleStrategy({
  clientID: configs.GOOGLE_CLIENT_ID,
  clientSecret: configs.GOOGLE_CLIENT_SECRET,
  callbackURL: `${configs.SERVER_URL}/auth/google/callback`,
  // callbackURL: `http://ec2-18-222-167-8.us-east-2.compute.amazonaws.com:5000/auth/google/callback`,
  accessType: 'offline'
}, (accessToken, refreshToken, profile, callback) => {
  // Extract the minimal profile information we need from the profile object
  // provided by Google
  callback(null, extractProfile(profile, 'google'));
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
      const query = Misc.usersQuery(req.user)
      const redirect = req.session.oauth2return || '/user?';
      delete req.session.oauth2return


      User.findOne(query, function(err, result) {
        // If result exists, return that userID
        // If result doesn't exist, create user and return newID
        if (result) {
          cb.redirectCallback(res, redirect, result.id)
        } else {
          const newUser = Misc.createUser(User, query);
          newUser.save((err, result) => cb.redirectCallback(res, redirect, result.id));
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

      const query = Misc.usersQuery(req.user)
      const redirect = req.session.oauth2return || '/user?';
      delete req.session.oauth2return;
      User.findOne(query, function(err, result) {
        // If result exists, return that userID
        // If result doesn't exist, create user and return newID
        if (result) {
          cb.redirectCallback(res, redirect, result.id)
        } else {
          const newUser = Misc.createUser(User, query);
          newUser.save((err, result) => cb.redirectCallback(res, redirect, result.id));
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
