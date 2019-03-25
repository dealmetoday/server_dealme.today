const JWT = require('../utils/jwt');
const mongoose = require('mongoose');
const Misc = require('../utils/misc');
const cb = require('../utils/callbacks');
const Security = require('../utils/security');
const constants = require('../config/constants')

let User = null;
let Request = null;
var userAuth = null;

module.exports = (app, usersDB, authDB, dealsDB) => {
  // Setting constructors
  User = usersDB.Users;
  Deal = dealsDB.Deals;
  userAuth = authDB.UserAuths;
  Request = authDB.Requests;

  // Create
  app.post('/users/email', async (req, res) => {
    const jsonData = req.body;
    const newID = mongoose.Types.ObjectId();

    if (!Misc.validObject(jsonData, ["email", "password"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    let query =
    {
      email: jsonData.email
    };

    // Check if an user with the same details already exist
    try {
      let result = await User.findOne(query).exec();
      let retVal = constants.SUCCESS;

      if (Misc.isEmptyObject(result)) {
        const newID = mongoose.Types.ObjectId();

        var newObj = new User(
          {
            _id: newID,
            provider: "Email",
            email: jsonData.email,
            first: "",
            middle: "",
            last: "",
            token: -1,
            age: -1,
            gender: "",
            location: ""
          });

        result = await newObj.save()
        console.log(result);

        if (!Misc.isEmptyObject(result)) {
          let ePassword = jsonData.password;
          let password = Security.decrypt(ePassword);
          let hashed = await Security.hashPassword(password);

          newObj = new userAuth({
            _id: result._id,
            role: constants.JWT_USER,
            password: hashed
          })

          result = await newObj.save()

          if (!Misc.isEmptyObject(result)) {
            retVal.id = result.id;
            res.send(retVal);
          } else {
            console.log("Auth creation failed");
            res.send(constants.FAILURE);
          }
        } else {
          console.log("User creation failed");
          res.send(constants.FAILURE);
        }
      } else {
        console.log("User already exists");
        retVal.id = result.id;
        res.send(retVal);
      }
    } catch (err) {
      console.log("Caught error");
      res.send(constants.FAILURE);
    }
  });

  app.post('/users/facebook', (req, res) => {
    const jsonData = req.body;

    if (!Misc.validObject(jsonData, ["first", "last", "email", "token"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    const newID = mongoose.Types.ObjectId();

    var newObj = new User(
      {
        _id: newID,
        provider: "Facebook",
        email: jsonData.email,
        first: jsonData.first,
        middle: "",
        last: jsonData.last,
        token: jsonData.token,
        age: -1,
        gender: "",
        location: ""
      });

    newObj.save((err, result) => cb.regCallback(res, err, result));
  });

  app.post('/users/google', (req, res) => {
    const jsonData = req.body;

    if (!Misc.validObject(jsonData, ["first", "last", "email", "token"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    const newID = mongoose.Types.ObjectId();

    var newObj = new User(
      {
        _id: newID,
        provider: "Google",
        email: jsonData.email,
        first: jsonData.first,
        middle: "",
        last: jsonData.last,
        token: jsonData.token,
        age: -1,
        gender: "",
        location: ""
      });

    newObj.save((err, result) => cb.regCallback(res, err, result));
  });

  // Read
  app.get('/users', (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_DEV)) {
      return;
    }

    User.find((err, result) => cb.callback(res, err, result));
  });

  // Update
  app.put('/users', (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_USER)) {
      return;
    }

    const jsonData = req.body;

    if (!Misc.validObject(jsonData, ["id"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    var id = jsonData.id;
    delete jsonData.id;

    User.findByIdAndUpdate(id, jsonData, (err, result) => cb.putCallback(res, err, result));
  });

  // delete
  app.delete('/users', (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_DEV)) {
      jsonData.request = "Delete Users";

      let newReq = Misc.createRequest(Request, jsonData);
      newReq.save((err, result) => cb.reqCallback(res, err, result));

      return;
    }

    const jsonData = req.body;

    if (!Misc.validObject(jsonData, ["id"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    User.findByIdAndDelete(jsonData.id, (err, result) => cb.callback(res, err, result));
  });

  /****************************************************************************/
  // Check if a user exists already
  app.put('/user/check', async (req, res) => {
    const jsonData = req.body;

    if (!Misc.validObject(jsonData, ["first", "last", "email", "password", "provider"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    let query =
    {
      email: jsonData.email
    };

    // Check if an user with the same details already exist
    try {
      let result = await User.findOne(query).exec();
      let retVal = constants.SUCCESS;

      if (Misc.isEmptyObject(result)) {
        const newID = mongoose.Types.ObjectId();

        let newObj = new User(
          {
            _id: newID,
            provider: jsonData.provider,
            email: jsonData.email,
            first: jsonData.first,
            middle: "",
            last: jsonData.last,
            age: -1,
            gender: "",
            location: ""
          });

        result = await newObj.save()
        console.log(result);

        if (!Misc.isEmptyObject(result)) {
          let ePassword = jsonData.password;
          let password = Security.decrypt(ePassword);
          let hashed = await Security.hashPassword(password);

          newObj = new userAuth({
            _id: result._id,
            role: constants.JWT_USER,
            password: hashed
          })

          result = await newObj.save()

          if (!Misc.isEmptyObject(result)) {
            retVal.id = result.id;
            res.send(retVal);
          } else {
            console.log("Auth creation failed");
            res.send(constants.FAILURE);
          }
        } else {
          console.log("User creation failed");
          res.send(constants.FAILURE);
        }
      } else {
        console.log("User already exists");
        retVal.id = result.id;
        res.send(retVal);
      }
    } catch (err) {
      console.log("Caught error");
      res.send(constants.FAILURE);
    }
  });

  // Get user profile by ID
  app.get('/user/profile', (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_USER)) {
      return;
    }

    const jsonData = JSON.parse(JSON.stringify(req.query));

    if (!Misc.validObject(jsonData, ["id"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    User.findById(jsonData.id, (err, result) => cb.callback(res, err, result));
  });

  // Get deals for a specific User
  app.get('/user/deals', (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_USER)) {
      return;
    }

    const jsonData = JSON.parse(JSON.stringify(req.query));

    if (!Misc.validObject(jsonData, ["id"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    User.findById(jsonData.id, (err, result) => {
      if (err) {
        res.send(constants.FAILURE);
      } else {
        let send = constants.SUCCESS;
        send.data = result.dealHistory;

        res.send(send);
      }
    });
  });
};
