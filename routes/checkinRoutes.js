const mongoose = require('mongoose')
const Misc = require('../utils/misc')
const cb = require('../utils/callbacks')

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

    newObj.save((err, result) => cb.regCallback(res, err, result));
  });

  // Read
  app.get('/checkins', function(req, res) {
    const jsonData = req.body;

    if (Misc.isEmptyObject(jsonData)) {
      CheckIn.find((err, result) => cb.regCallback(res, err, result));
    } else {
      CheckIn.find(jsonData, (err, result) => cb.regCallback(res, err, result));
    }
  });

  // Update
  app.put('/checkins', function(req, res) {
    const jsonData = req.body;
    var id = jsonData.id;
    delete jsonData.id;

    CheckIn.findByIdAndUpdate(id, jsonData, (err, result) => cb.putCallback(res, err, result));
  });

  // delete
  app.delete('/checkins', function(req, res) {
    const jsonData = req.body;

    CheckIn.findByIdAndDelete(jsonData.id, (err, result) => cb.regCallback(res, err, result));
  });
};
