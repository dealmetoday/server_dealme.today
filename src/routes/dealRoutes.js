const JWT = require('../utils/jwt');
const mongoose = require('mongoose');
const Misc = require('../utils/misc');
const cb = require('../utils/callbacks');
const constants = require('../config/constants');

var Deal = null;
var User = null;

module.exports = (app, dealsDB, usersDB) => {
  // Setting constructor
  Deal = dealsDB.Deals;
  User = usersDB.Users;

  // Create
  app.post('/deals', (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_STORE)) {
      return;
    }

    const jsonData = req.body;

    if (!Misc.validObject(jsonData, ["tags", "mall", "store", "description"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    const newID = mongoose.Types.ObjectId();

    var newObj = new Deal(
      {
        _id: newID,
        tags: jsonData.tags,
        isActive: jsonData.isActive,
        description: jsonData.description,
        creationDate: jsonData.creationDate,
        expiryDate: jsonData.expiryDate,
        format: jsonData.format,
        usesLeft: jsonData.usesLeft,
        views: 0,
        claims: 0,
        mall: jsonData.mall,
        store: jsonData.store
      });

    newObj.save((err, result) => cb.callback(res, err, result));
  });

  // Read
  app.get('/deals', (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_USER, true)) {
      return;
    }

    const jsonData = JSON.parse(JSON.stringify(req.query));
    if(jsonData.hasOwnProperty("tags")){
      let tagsArray = jsonData.tags.split(",")
      jsonData.tags = tagsArray
    }

    if (Misc.isEmptyObject(jsonData)) {
      Deal.find((err, result) => cb.callback(res, err, result));
    } else {
      const query = Misc.dealsQuery(jsonData);
      Deal.find(query, (err, result) => {
          let response = []
          result.sort((a, b) => (a.store > b.store) ? 1 : (a.store < b.store) ? -1 : 0)

          result.map( aDeal => {
            let index = response.findIndex(function(aStore) {
              return aStore._id.toString() === aDeal.store.toString()
            })
            if(index > -1){
              response[index].dealList.push(aDeal)
            }
            else{
              let storeObj = {}
              storeObj._id = aDeal.store.toString()
              storeObj.dealList = [];
              storeObj.dealList.push(aDeal)
              response.push(storeObj)
            }
          })
          cb.callback(res, err, response)
      });
    }
  });

  // Update
  app.put('/deals', (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_STORE)) {
      return;
    }

    const jsonData = req.body;

    if (!Misc.validObject(jsonData, ["id"]) || Misc.validObject(jsonData, ["creationDate", "views", "claims"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    var id = jsonData.id;
    delete jsonData.id;
    console.log(jsonData);

    Deal.findByIdAndUpdate(id, jsonData, (err, result) => cb.putCallback(res, err, result));
  });

  // delete
  app.delete('/deals', (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_STORE)) {
      return;
    }

    const jsonData = req.body;

    if (!Misc.validObject(jsonData, ["id"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    Deal.findByIdAndDelete(jsonData.id, (err, result) => cb.callback(res, err, result));
  });

  // Increment the number of claims a deal has given a deal and user ID
  app.put('/deals/claim', (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_USER)) {
      return;
    }

    const jsonData = JSON.parse(JSON.stringify(req.query));

    if (!Misc.validObject(jsonData, ["dealID", "userID"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    let dealID = queryArgs['dealID'].toString();
    let userID = queryArgs['userID'].toString();
    console.log(dealID);
    console.log(userID);

    if (!Misc.isValidObjectId(dealID) || !Misc.isValidObjectId(userID)) {
      res.send(constants.ID_ERROR);
      return;
    }
    console.log('valid IDs');

    // Welcome to callback heaven
    Deal.find({_id: dealID}, (err, result) => {
      // Check if deal exists
      if (err || result.length === 0) {
        res.send(constants.NOT_FOUND_ERROR);
      } else {
        // Check if user exists
        User.find({_id: userID}, (err, result) => {
          if (err || result.length === 0) {
            res.send(constants.NOT_FOUND_ERROR);
          } else if (result[0].dealHistory.indexOf(dealID) !== -1) {
            // If this user has already claimed the deal, do not claim it again
            res.send(constants.DUPLICATE_ERROR);
          } else {
            console.log(result[0].dealHistory);
            console.log(result[0].dealHistory.indexOf(dealID));
            // Add the deal into the user's deal history and increment the deal's number of claims.
            User.findOneAndUpdate({_id: userID}, {$push: {'dealHistory': dealID}}, (err, result) => {
              if (err || !result) {
                // Should never get here
                res.send(constants.ERR);
              } else {
                Deal.findOneAndUpdate({_id: dealID}, {$inc: {'claims': 1}}, (err, result) => cb.putCallback(res, err, result, null));
              }
            });
          }
        }).limit(1);
      }
    }).limit(1);
  });
};
