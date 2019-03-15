const JWT = require('../utils/jwt');
const mongoose = require('mongoose');
const Misc = require('../utils/misc');
const cb = require('../utils/callbacks');
const Security = require('../utils/security');
const constants = require('../config/constants');

let Mall = null;
let Store = null;
let Request = null;
let storeAuth = null;

module.exports = (app, mallsDB, requestDB, authDB) => {
  // Setting constructor
  Mall = mallsDB.Malls;
  Store = mallsDB.Stores;
  Request = requestDB.Requests;
  storeAuth = authDB.StoreAuths;

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
  app.post('/stores', async (req, res) => {
    const jsonData = req.body;

    if (!Misc.validObject(jsonData, ["name", "email", "password"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    let query =
    {
      email: jsonData.email
    };

    // Check if an user with the same details already exist
    try {
      let result = await Store.findOne(query).exec();
      let retVal = constants.SUCCESS;

      if (Misc.isEmptyObject(result)) {
        let parent = "";
        const newID = mongoose.Types.ObjectId();

        if (jsonData.hasOwnProperty("parentCompany")) {
          parent = jsonData.parentCompany;
        }

        var newObj = new Store(
          {
            _id: newID,
            // mall: null,
            // location: "",
            name: jsonData.name,
            email: jsonData.email,
            // tags: [],
            // description: "",
            parentCompany: parent
          });

        result = await newObj.save();

        console.log(result);

        if (!Misc.isEmptyObject(result)) {
          let ePassword = jsonData.password;
          let password = Security.decrypt(ePassword);
          let hashed = await Security.hashPassword(password);

          newObj = new storeAuth({
            _id: result._id,
            role: constants.JWT_STORE,
            password: hashed
          })

          result = await newObj.save()

          if (!Misc.isEmptyObject(result)) {
            retVal.id = result.id;
            res.send(retVal);
          } else {
            console.log("Auth creation failed");
            res.send(constants.FAILURE);
          }
        } else {
          console.log("User creation failed");
          res.send(constants.FAILURE);
        }
      } else {
        console.log("Store already exists");
        retVal.id = result.id;
        res.send(retVal);
      }
    } catch (err) {
      console.log(err);
      console.log("Caught error");
      res.send(constants.FAILURE);
    }
  });

  // Read
  app.get('/stores', (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_USER, true)) {
      return;
    }

    const jsonData = JSON.parse(JSON.stringify(req.query));

    if(jsonData.hasOwnProperty("_id")){
      let idArray = jsonData._id.split(",")
      jsonData._id = idArray
    }
    const query = Misc.storeQuery(jsonData)

    Store.find(query ? query : {}, (err, result) => cb.callback(res, err, result));
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

  // Read
  app.get('/stores/check', async  (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_STORE, true)) {
      return;
    }

    const jsonData = JSON.parse(JSON.stringify(req.query));

    Store.findById(jsonData.id, (err, result) => cb.storeCheckCallback(res, err, result));
  });
};
