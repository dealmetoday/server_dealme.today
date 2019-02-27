const mongoose = require('mongoose')
const Misc = require('../utils/misc')
const cb = require('../utils/callbacks')
const Security = require('../utils/security');
const constants = require('../config/constants');

var userAuth = null;
var storeAuth = null;

module.exports = function(app, authDB, usersDB) {
  // Setting constructors
  userAuth = authDB.UserAuths;
  storeAuth = authDB.StoreAuths;
  User = usersDB.Users;

  // Social media login
  app.put('/auth/login/social', (req,res) => {
    // Assume that:
    // 1. login was successful
    // 2. User exists in database (created user beforehand)
    const jsonData = req.body;
    let query = Misc.usersQuery(jsonData);

    User.find(query, (err, result) => {
      if (err) {
        res.send(constants.ERR);
      } else {
        let update = { password: jsonData.token };

        if (jsonData.role == constants.USERS) {
          userAuth.findOneAndUpdate(result._id, update, (err, result) => cb.loginCallback(res, err, result));
        } else if (jsonData.role == constants.STORES) {
          storeAuth.findOneAndUpdate(result._id, update, (err, result) => cb.loginCallback(res, err, result));
        }
      }
    });
  });

  // Email login
  app.put('/auth/login/email', function(req, res) {
    const jsonData = req.body;

    let ePassword = jsonData.password;
    let password = Security.decrypt(ePassword);

    // Check if user with email exists
    // If not, no response
    let queryResult = Misc.userExists(jsonData.email);
    if (queryResult.status) {
      if (jsonData.role == constants.USERS) {
        userAuth.findOneById(queryResult.id, (err, result) => cb.emailCallback(res, err, result, password));
      } else if (jsonData.role == constants.STORES) {
        storeAuth.findOneById(queryResult.id, (err, result) => cb.emailCallback(res, err, result, password));
      }
    }
  });

  // Updating password
  app.put('/auth/password', function(req, res) {
    const jsonData = req.body;

    let ePassword = jsonData.password;
    let password = Security.decrypt(ePassword);
    let hashed = Security.hashPassword(password);
    let update = { password: hashed };

    // Check if user with email exists
    // If not, reply with constants.FAILURE
    let queryResult = Misc.userExists(jsonData.email);
    if (queryResult.status) {
      if (jsonData.role == constants.USERS) {
        userAuth.findOneAndUpdate(queryResult.id, update, (err, result) => cb.putCallback(res, err, result));
      } else if (jsonData.role == constants.STORES) {
        storeAuth.findOneAndUpdate(queryResult.id, update, (err, result) => cb.putCallback(res, err, result));
      }
    } else {
      res.send(constants.FAILURE);
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
