const mongoose = require('mongoose')
const Utils = require('./utils')

var CheckIn = null;

module.exports = function(app, checkInDB) {
  // Setting constructor
  CheckIn = checkInDB.CheckIns;

  // Create
  app.post('/checkins', function(req, res) {
    const jsonData = req.body;
    const newID = mongoose.Types.ObjectId();

    var newObj = new CheckIn(
      {
        _id: newID,
        time: Date.now(),
        mall: jsonData.mall,
        user: jsonData.user
      });

    newObj.save((err, result) => Utils.callBack(res, err, result));
  });

  // Read
  app.get('/checkins', function(req, res) {
    const jsonData = req.body;

    if (Utils.isEmptyObject(jsonData)) {
      CheckIn.find((err, result) => Utils.callBack(res, err, result));
    } else {
      CheckIn.find(jsonData, (err, result) => Utils.callBack(res, err, result));
    }
  });

  // // Update
  // app.put('/checkins', function(req, res) {
  //   const jsonData = req.body;
  //   var id = jsonData.id;
  //   delete jsonData.id;
  //
  //   CheckIn.findByIdAndUpdate(id, jsonData, (err, result) => Utils.putCallback(res, err, result));
  // });

  // delete
  app.delete('/checkins', function(req, res) {
    const jsonData = req.body;

    CheckIn.findByIdAndDelete(jsonData.id, (err, result) => Utils.callBack(res, err, result));
  });
};
