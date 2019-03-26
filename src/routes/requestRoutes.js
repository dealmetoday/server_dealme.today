const JWT = require('../utils/jwt');
const mongoose = require('mongoose');
const Misc = require('../utils/misc');
const cb = require('../utils/callbacks');
const constants = require('../config/constants');

let Request = null;
let Store = null;
let Tag = null;
let User = null;

module.exports = (app, dbs) => {
  // Setting constructor
  Request = dbs.authDB.Requests;
  Store = dbs.mallsDB.Stores;
  Tag = dbs.usersDB.Tags;
  User = dbs.usersDB.Users;

  app.get('/request', (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_DEV)) {
      return;
    }

    Request.find((err, result) => cb.callback(res, err, result));
  });

  app.put('/request/approve', async (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_DEV)) {
      return;
    }

    const jsonData = req.body;

    // Validate jsonData
    if (!Misc.validObject(jsonData, ["id"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    try {
      let result = await Request.findById(jsonData.id).exec({});

      if (!Misc.isEmptyObject(result)) {
        // Delete the request and perform requested action on appropriate model
        await Request.findByIdAndDelete(jsonData.id);

        switch (result.model) {
          case constants.MODEL.stores:
            // Deleting a store
            Store.findByIdAndDelete(result.content.id, (err, result) => cb.callback(res, err, result));
            break;
          case constants.MODEL.tags:
            // Can be create or delete
            if (result.content.request === constants.REQUEST.delete) {
              Tag.findByIdAndDelete(result.content.id, (err, result) => cb.callback(res, err, result));
            } else if (result.content.request === constants.REQUEST.create) {
              const newID = mongoose.Types.ObjectId();

              var newObj = new Tag({ _id: newID, key: result.content.key});

              newObj.save((err, result) => cb.callback(res, err, result));
            }
            break;
          case constants.MODEL.users:
            // Deleting user
            User.findByIdAndDelete(result.content.id, (err, result) => cb.callback(res, err, result));
            break;
          default:
            break;
        }
      } else {
        console.log("Request doesn't exist - also shouldn't ever be here lol.");
        res.send(constants.FAILURE);
      }
    } catch (err) {
      console.log("Caught error");
      res.send(constants.FAILURE);
    }
  });

  app.put('/request/reject', (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_DEV)) {
      return;
    }

    const jsonData = req.body;

    // Validate jsonData
    if (!Misc.validObject(jsonData, ["id"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    Request.findByIdAndDelete(jsonData.id, (err, result) => cb.callback(res, err, result));
  })
};
