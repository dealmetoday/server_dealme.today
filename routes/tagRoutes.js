const mongoose = require('mongoose')
const Utils = require('./utils')
const constants = require('../config/constants')

var Tag = null;

module.exports = function(app, tagsDB) {
  // Setting constructor
  Tag = tagsDB.Tags;

  // Create
  app.post('/tags', function(req, res) {
    const jsonData = req.body;
    const newID = mongoose.Types.ObjectId();

    var newObj = new Tag({ _id: newID, key: jsonData.key});

    newObj.save((err, result) => Utils.callBack(res, err, result));
  });

  // Read
  app.get('/tags', function(req, res) {
    Tag.find((err, result) => Utils.callBack(res, err, result));
  });

  // Update
  app.put('/tags', function(req, res) {
    const jsonData = req.body;

    var update =
    {
      key: jsonData.update
    };

    if (jsonData.index == "name") {
      Tag.findOneAndUpdate({ key: jsonData.key}, update, (err, result) => Utils.putCallback(res, err, result));
    } else if (jsonData.index == "ID") {
      if (!(Utils.isValidObjectId(jsonData.key))) {
        res.send(constants.ID_ERROR);
        return;
      }
      Tag.findByIdAndUpdate(jsonData.key, update, (err, result) => Utils.putCallback(res, err, result));
    }
  });

  // delete
  app.delete('/tags', function(req, res) {
    const jsonData = req.body;

    Tag.findOneAndDelete(jsonData, (err, result) => Utils.callBack(res, err, result));
  });
};
