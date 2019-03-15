const JWT = require('../utils/jwt');
const mongoose = require('mongoose');
const Misc = require('../utils/misc');
const cb = require('../utils/callbacks');
const Security = require('../utils/security');
const constants = require('../config/constants');

var userAuth = null;
var storeAuth = null;

module.exports = (app, authDB, usersDB, mallsDB) => {
  // Setting constructors
  userAuth = authDB.UserAuths;
  storeAuth = authDB.StoreAuths;
  User = usersDB.Users;
  Store = mallsDB.Stores;

  // Updating password
  app.put('/auth/email', async (req, res) => {
    const jsonData = req.body;
    let role = jsonData.role;

    if (!JWT.verify(req.get("Bearer"), role)) {
      return;
    }

    // Validate jsonData and query
    if (!Misc.validObject(jsonData, ["email", "password", "role"])) {
      res.send(constants.ARGS_ERROR);
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

  // Social media login
  app.put('/auth/login/social', (req, res) => {
    // Assume that:
    // 1. login was successful
    // 2. User exists in database (created user beforehand)
    const jsonData = req.body;
    let query = Misc.usersQuery(jsonData);

    // Validate jsonData and query
    if (Misc.isEmptyObject(query) || !Misc.validObject(jsonData, ["role", "token"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    User.findOne(query, (err, result) => {
      if (err) {
        res.send(constants.ERR);
      } else {
        let update = { password: jsonData.token };
        let email = result.email;

        userAuth.findByIdAndUpdate(result._id, update, (err, result) => cb.socialCallback(res, err, result, email));
      }
    });
  });

  // Email login
  app.put('/auth/login/email', async (req, res) => {
    const jsonData = req.body;

    // Validate jsonData and query
    if (!Misc.validObject(jsonData, ["email", "password", "role"]) || !Misc.validEmail(jsonData.email)) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    let ePassword = jsonData.password;
    let password = Security.decrypt(ePassword);

    // Check if user with email exists
    // If not, no response
    let queryResult = null;
    if (jsonData.role == constants.JWT_USER) {
      queryResult = await Misc.userExists(User, jsonData.email);
      if (queryResult.status) {
        userAuth.findById(queryResult.id, (err, result) => cb.emailCallback(res, err, result, password, jsonData.email));
      }
    } else if (jsonData.role == constants.JWT_STORE) {
      queryResult = await Misc.storeExists(Store, jsonData.email);
      if (queryResult.status) {
        storeAuth.findById(queryResult.id, (err, result) => cb.emailCallback(res, err, result, password, jsonData.email));
      }
    }
  });
};
