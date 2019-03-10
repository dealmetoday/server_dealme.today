const JWT = require('../utils/jwt');
const mongoose = require('mongoose');
const Misc = require('../utils/misc');
const cb = require('../utils/callbacks');
const constants = require('../config/constants');

let Mall = null;
let Store = null;
let Request = null;

module.exports = (app, mallsDB, requestDB) => {
  // Setting constructor
  Mall = mallsDB.Malls;
  Store = mallsDB.Stores;
  Request = requestDB.Requests;

  /****************************************************************************/
  // Create
  app.post('/malls', (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_STORE)) {
      return;
    }

    const jsonData = req.body;

    if (!Misc.validObject(jsonData, ["address", "name", "tags"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    const newID = mongoose.Types.ObjectId();

    var newObj = new Mall(
      {
        _id: newID,
        address: jsonData.address,
        name: jsonData.name,
        tags: jsonData.tags,
        numOfStores: 0
      });

    newObj.save((err, result) => cb.callback(res, err, result));
  });

  // Read
  app.get('/malls', (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_USER)) {
      return;
    }

    const jsonData = req.body;

    if (Misc.isEmptyObject(jsonData)) {
      Mall.find((err, result) => cb.callback(res, err, result));
    } else {
      if (!Misc.validObject(jsonData, ["tags"])) {
        res.send(constants.ARGS_ERROR);
        return;
      }

      var query =
      {
        "tags":
        {
          $all : jsonData.tags
        }
      }
      Mall.find(query, (err, result) => cb.callback(res, err, result));
    }
  });

  // Update
  app.put('/malls', (req, res) => {
    const jsonData = req.body;

    if (!JWT.verify(req.get("Bearer"), constants.JWT_DEV)) {
      jsonData.request = "Update Malls";
      let newReq = Misc.createRequest(Request, jsonData);
      newReq.save((err, result) => cb.reqCallback(res, err, result));

      return;
    }

    if (!Misc.validObject(jsonData, ["id"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    var id = jsonData.id;
    delete jsonData.id;

    Mall.findByIdAndUpdate(id, jsonData, (err, result) => cb.putCallback(res, err, result));
  });

  // delete
  app.delete('/malls', (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_DEV)) {
      jsonData.request = "Delete Malls";
      let newReq = Misc.createRequest(Request, jsonData);
      newReq.save((err, result) => cb.reqCallback(res, err, result));

      return;
    }

    const jsonData = req.body;

    if (!Misc.validObject(jsonData, ["id"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    Mall.findByIdAndDelete(jsonData.id, (err, result) => cb.callback(res, err, result));
  });

  /****************************************************************************/
  // Create
  app.post('/stores', (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_STORE)) {
      return;
    }

    const jsonData = req.body;

    if (!Misc.validObject(jsonData, ["mall", "location", "name", "email", "tags", "description", "parentCompany"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    const newID = mongoose.Types.ObjectId();

    var newObj = new Store(
      {
        _id: newID,
        mall: jsonData.mall,
        location: jsonData.location,
        name: jsonData.name,
        email: jsonData.email,
        tags: jsonData.tags,
        description: jsonData.description,
        parentCompany: jsonData.parentCompany
      });

    // TODO: Create entry in Auth database too
    newObj.save((err, result) => cb.callback(res, err, result));
  });

  // Read
  app.get('/stores', (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_USER, true)) {
      return;
    }

    const jsonData = JSON.parse(JSON.stringify(req.query));

    Store.find(jsonData? jsonData : {}, (err, result) => cb.callback(res, err, result));
  });

  // Update
  app.put('/stores', (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_STORE)) {
      return;
    }

    const jsonData = req.body;

    if (!Misc.validObject(jsonData, ["id"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    const storeID = jsonData.id;
    delete jsonData.id;

    Store.findByIdAndUpdate(storeID, jsonData, (err, result) => cb.putCallback(res, err, result));
  });

  // delete
  app.delete('/stores', (req, res) => {
    const jsonData = req.body;
    
    if (!JWT.verify(req.get("Bearer"), constants.JWT_DEV)) {
      jsonData.request = "Delete Stores";

      let newReq = Misc.createRequest(Request, jsonData);
      newReq.save((err, result) => cb.reqCallback(res, err, result));

      return;
    }

    if (!Misc.validObject(jsonData, ["id"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    Store.findByIdAndDelete(jsonData.id, (err, result) => cb.callback(res, err, result));
  });
};
