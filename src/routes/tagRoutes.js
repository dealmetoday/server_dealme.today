const JWT = require('../utils/jwt');
const mongoose = require('mongoose');
const Misc = require('../utils/misc');
const cb = require('../utils/callbacks');
const constants = require('../config/constants');

let Tag = null;
let Request = null;

module.exports = (app, tagsDB, requestDB) => {
  // Setting constructor
  Tag = tagsDB.Tags;
  Request = requestDB.Requests;

  // Create
  app.post('/tags', (req, res) => {
    const jsonData = req.body;

    if (!JWT.verify(req.get("Bearer"), constants.JWT_DEV)) {
      jsonData.request = "Create Tags";

      let newReq = Misc.createRequest(Request, jsonData);
      newReq.save((err, result) => cb.reqCallback(res, err, result));

      return;
    }

    // Validate jsonData
    if (!Misc.validObject(jsonData, ["key"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    const newID = mongoose.Types.ObjectId();

    var newObj = new Tag({ _id: newID, key: jsonData.key});

    newObj.save((err, result) => cb.callback(res, err, result));
  });

  // Read
  app.get('/tags', (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_USER, true)) {
      return;
    }

    Tag.find((err, result) => cb.callback(res, err, result));
  });

  // Update
  app.put('/tags', (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_DEV, true)) {
      return;
    }

    const jsonData = req.body;

    if (!Misc.validObject(jsonData, ["index", "key", "Update"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

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
    if (!JWT.verify(req.get("Bearer"), constants.JWT_DEV)) {
      jsonData.request = "Delete Tags";

      let newReq = Misc.createRequest(Request, jsonData);
      newReq.save((err, result) => cb.reqCallback(res, err, result));

      return;
    }

    const jsonData = req.body;

    if (!Misc.validObject(jsonData, ["id"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    Tag.findByIdAndDelete(jsonData.id, (err, result) => cb.callback(res, err, result));
  });
};
