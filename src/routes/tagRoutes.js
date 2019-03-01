const JWT = require('../utils/jwt');
const mongoose = require('mongoose');
const Misc = require('../utils/misc');
const cb = require('../utils/callbacks');
const constants = require('../config/constants');

var Tag = null;

module.exports = (app, tagsDB) => {
  // Setting constructor
  Tag = tagsDB.Tags;

  // Create
  app.post('/tags', (req, res) => {
    if (!JWT.verify(req.get("Bearer"))) {
      return;
    }
    const jsonData = req.body;
    const newID = mongoose.Types.ObjectId();

    var newObj = new Tag({ _id: newID, key: jsonData.key});

    newObj.save((err, result) => cb.callback(res, err, result));
  });

  // Read
  app.get('/tags', (req, res) => {
    if (!JWT.verify(req.get("Bearer"))) {
      return;
    }

    Tag.find((err, result) => cb.callback(res, err, result));
  });

  // Update
  app.put('/tags', (req, res) => {
    if (!JWT.verify(req.get("Bearer"))) {
      return;
    }

    const jsonData = req.body;

    var update =
    {
      key: jsonData.update
    };

    if (jsonData.index == "name") {
      Tag.findOneAndUpdate({ key: jsonData.key}, update, (err, result) => cb.putCallback(res, err, result));
    } else if (jsonData.index == "ID") {
      if (!(Misc.isValidObjectId(jsonData.key))) {
        res.send(constants.ID_ERROR);
        return;
      }
      Tag.findByIdAndUpdate(jsonData.key, update, (err, result) => cb.putCallback(res, err, result));
    }
  });

  // delete
  app.delete('/tags', (req, res) => {
    if (!JWT.verify(req.get("Bearer"))) {
      return;
    }

    const jsonData = req.body;

    Tag.findOneAndDelete(jsonData, (err, result) => cb.callback(res, err, result));
  });
};
