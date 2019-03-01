const JWT = require('../utils/jwt');
const mongoose = require('mongoose');
const Misc = require('../utils/misc');
const cb = require('../utils/callbacks');
const Security = require('../utils/security');
const constants = require('../config/constants');

var userAuth = null;
var storeAuth = null;

module.exports = (app, authDB, usersDB) => {
  // Setting constructors
  userAuth = authDB.UserAuths;
  storeAuth = authDB.StoreAuths;
  User = usersDB.Users;

  // Social media login
  app.put('/auth/login/social', (req, res) => {
    // Assume that:
    // 1. login was successful
    // 2. User exists in database (created user beforehand)
    const jsonData = req.body;
    let query = Misc.usersQuery(jsonData);

    User.findOne(query, (err, result) => {
      if (err) {
        res.send(constants.ERR);
      } else {
        let update = { password: jsonData.token };
        let email = result.email;

        if (jsonData.role == constants.JWT_USER) {
          userAuth.findByIdAndUpdate(result._id, update, (err, result) => cb.socialCallback(res, err, result, email));
        } else if (jsonData.role == constants.JWT_STORE) {
          storeAuth.findByIdAndUpdate(result._id, update, (err, result) => cb.socialCallback(res, err, result, email));
        }
      }
    });
  });

  // Email login
  app.put('/auth/login/email', async (req, res) => {
    const jsonData = req.body;

    let ePassword = jsonData.password;
    let password = Security.decrypt(ePassword);

    // Check if user with email exists
    // If not, no response
    let queryResult = await Misc.userExists(User, jsonData.email);
    if (queryResult.status) {
      if (jsonData.role == constants.JWT_USER) {
        userAuth.findById(queryResult.id, (err, result) => cb.emailCallback(res, err, result, password, jsonData.email));
      } else if (jsonData.role == constants.JWT_STORE) {
        storeAuth.findById(queryResult.id, (err, result) => cb.emailCallback(res, err, result, password, jsonData.email));
      }
    }
  });

  // Updating password
  app.put('/auth/password', async (req, res) => {
    const jsonData = req.body;
    let role = jsonData.role;

    if (!JWT.verify(req.get("Bearer"), role)) {
      return;
    }

    let ePassword = jsonData.password;
    let password = Security.decrypt(ePassword);
    let hashed = await Security.hashPassword(password);
    let update = { password: hashed };

    // Check if user with email exists
    // If not, reply with constants.FAILURE
    let queryResult = await Misc.userExists(User, jsonData.email);
    if (queryResult.status) {
      if (role == constants.JWT_USER) {
        userAuth.findByIdAndUpdate(queryResult.id, update, (err, result) => cb.putCallback(res, err, result));
      } else if (role == constants.JWT_STORE) {
        storeAuth.findByIdAndUpdate(queryResult.id, update, (err, result) => cb.putCallback(res, err, result));
      }
    } else {
      res.send(constants.FAILURE);
    }
  });
};
