const mongoose = require('mongoose')
const Utils = require('./utils')

var User = null;

module.exports = function(app, usersDB, dealsDB) {
  // Setting constructors
  User = usersDB.Users;
  Deal = dealsDB.Deals;

  // Create
  app.post('/users/email', function(req, res) {
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

    newObj.save((err, result) => Utils.callBack(res, err, result));
  });

  app.post('users/facebook', function(req, res) {
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

    newObj.save((err, result) => Utils.callBack(res, err, result));
  });

  app.post('users/google', function(req, res) {
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

    newObj.save((err, result) => Utils.callBack(res, err, result));
  });

  // Read
  app.get('/users', function(req, res) {
    const jsonData = req.body;

    if (Utils.isEmptyObject(jsonData)) {
      User.find((err, result) => Utils.callBack(res, err, result));
    } else {
      User.findOne({ email: jsonData.email }, (err, result) => Utils.callBack(res, err, result));
    }
  });

  // Update
  app.put('/users', function(req, res) {
    const jsonData = req.body;
    var id = jsonData.id;
    delete jsonData.id;

    User.findByIdAndUpdate(id, jsonData, (err, result) => Utils.putCallback(res, err, result));
  });

  // delete
  app.delete('/users', function(req, res) {
    const jsonData = req.body;

    User.findByIdAndDelete(jsonData.id, (err, result) => Utils.callBack(res, err, result));
  });

  /****************************************************************************/
  // Get user profile by ID
  app.get('/user/profile', function(req, res) {
    const jsonData = req.body;

    User.findById(jsonData.id, (err, result) => Utils.callBack(res, err, result));
  });

  // Get deals for a specific User
  app.get('/user/deals', function(req, res) {
    const jsonData = req.body;
    const query = Utils.dealsQuery(jsonData);

    Deal.find(query, (err, result) => Utils.callBack(res, err, result));
  });
};
