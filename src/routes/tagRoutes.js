const JWT = require('../utils/jwt');
const mongoose = require('mongoose');
const Misc = require('../utils/misc');
const cb = require('../utils/callbacks');
const constants = require('../config/constants');

let Tag = null;
let Request = null;

module.exports = (app, usersDB, authDB) => {
  // Setting constructor
  Tag = usersDB.Tags;
  Request = authDB.Requests;

  // Create
  app.post('/tags', (req, res) => {
    const jsonData = req.body;

    // Validate jsonData
    if (!Misc.validObject(jsonData, ["key"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    if (!JWT.verify(req.get("Bearer"), constants.JWT_DEV)) {
      jsonData.request = constants.REQUEST.create;

      let newReq = Misc.createRequest(Request, jsonData, constants.MODEL.tags);
      newReq.save((err, result) => cb.reqCallback(res, err, result));

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

    if (!Misc.validObject(jsonData, ["index", "key", "update"])) {
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
    const jsonData = req.body;

    if (!Misc.validObject(jsonData, ["id"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    if (!JWT.verify(req.get("Bearer"), constants.JWT_DEV)) {
      jsonData.request = constants.REQUEST.delete;

      let newReq = Misc.createRequest(Request, jsonData, constants.MODEL.tags);
      newReq.save((err, result) => cb.reqCallback(res, err, result));

      return;
    }

    Tag.findByIdAndDelete(jsonData.id, (err, result) => cb.callback(res, err, result));
  });
};
