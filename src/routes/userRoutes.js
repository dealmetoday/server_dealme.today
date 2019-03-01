const JWT = require('../utils/jwt');
const mongoose = require('mongoose');
const Misc = require('../utils/misc');
const cb = require('../utils/callbacks');

var User = null;

module.exports = (app, usersDB, dealsDB) => {
  // Setting constructors
  User = usersDB.Users;
  Deal = dealsDB.Deals;

  // Create
  app.post('/users/email', (req, res) => {
    if (!JWT.verify(req.get("Bearer"))) {
      return;
    }

    const jsonData = req.body;
    const newID = mongoose.Types.ObjectId();

    var newObj = new User(
      {
        _id: newID,
        provider: "Email",
        email: jsonData.email,
        first: jsonData.first,
        middle: "",
        last: jsonData.last,
        age: -1,
        gender: "",
        location: ""
      });

    // TODO: Create entry in Auth database too
    newObj.save((err, result) => cb.regCallback(res, err, result));
  });

  app.post('users/facebook', (req, res) => {
    if (!JWT.verify(req.get("Bearer"))) {
      return;
    }

    const jsonData = req.body;

    var newObj = new User(
      {
        _id: jsonData.token,
        provider: "Facebook",
        email: jsonData.email,
        first: jsonData.first,
        middle: "",
        last: jsonData.last,
        age: -1,
        gender: "",
        location: ""
      });

    newObj.save((err, result) => cb.regCallback(res, err, result));
  });

  app.post('users/google', (req, res) => {
    if (!JWT.verify(req.get("Bearer"))) {
      return;
    }

    const jsonData = req.body;

    var newObj = new User(
      {
        _id: jsonData.token,
        provider: "Google",
        email: jsonData.email,
        first: jsonData.first,
        middle: "",
        last: jsonData.last,
        age: -1,
        gender: "",
        location: ""
      });

    newObj.save((err, result) => cb.regCallback(res, err, result));
  });

  // Read
  app.get('/users', (req, res) => {
    if (!JWT.verify(req.get("Bearer"))) {
      return;
    }

    const jsonData = req.body;

    if (Misc.isEmptyObject(jsonData)) {
      User.find((err, result) => cb.callback(res, err, result));
    } else {
      User.findOne({ email: jsonData.email }, (err, result) => cb.callback(res, err, result));
    }
  });

  // Update
  app.put('/users', (req, res) => {
    if (!JWT.verify(req.get("Bearer"))) {
      return;
    }

    const jsonData = req.body;
    var id = jsonData.id;
    delete jsonData.id;

    User.findByIdAndUpdate(id, jsonData, (err, result) => cb.putCallback(res, err, result));
  });

  // delete
  app.delete('/users', (req, res) => {
    if (!JWT.verify(req.get("Bearer"))) {
      return;
    }

    const jsonData = req.body;

    User.findByIdAndDelete(jsonData.id, (err, result) => cb.callback(res, err, result));
  });

  /****************************************************************************/
  // Get user profile by ID
  app.get('/user/profile', (req, res) => {
    if (!JWT.verify(req.get("Bearer"))) {
      return;
    }

    const jsonData = req.body;

    User.findById(jsonData.id, (err, result) => cb.callback(res, err, result));
  });

  // Get deals for a specific User
  app.get('/user/deals', (req, res) => {
    if (!JWT.verify(req.get("Bearer"))) {
      return;
    }

    const jsonData = req.body;
    const query = Misc.dealsQuery(jsonData);

    Deal.find(query, (err, result) => cb.callback(res, err, result));
  });
};
