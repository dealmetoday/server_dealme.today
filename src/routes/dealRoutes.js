const JWT = require('../utils/jwt');
const mongoose = require('mongoose');
const Misc = require('../utils/misc');
const cb = require('../utils/callbacks');
const constants = require('../config/constants');

var Deal = null;
var User = null;
var Stat = null;

module.exports = (app, dealsDB, usersDB) => {
  // Setting constructor
  Deal = dealsDB.Deals;
  User = usersDB.Users;
  Stat = dealsDB.Stats;

  // Create
  app.post('/deals', async (req, res) => {
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
        creationDate: Misc.createDate(jsonData.creationDate),
        expiryDate: Misc.createDate(jsonData.expiryDate),
        format: jsonData.format,
        usesLeft: jsonData.usesLeft,
        views: 0,
        claims: 0,
        mall: jsonData.mall,
        store: jsonData.store
      });

    try {
      let result = await newObj.save();

      if (!Misc.isEmptyObject(result)) {
        let update = { $push: { allDeals: newID } };
        if (jsonData.isActive) {
          update =
          {
            $push:
            {
              allDeals: newID,
              activeDeals: newID
            }
          }
        }

        Stat.findByIdAndUpdate(jsonData.store, update, (err, result) => cb.callback(res, err, result));
      } else {
        console.log("Deal creation failed");
        res.send(constants.FAILURE);
      }
    } catch (err) {
      console.log(err);
      console.log("Caught error");
      res.send(constants.FAILURE);
    }
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

  // Get all deals belonging to a specific store
  app.get('/deals/store', async (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_STORE, true)) {
      return;
    }

    const jsonData = JSON.parse(JSON.stringify(req.query));

    if (!Misc.validObject(jsonData, ["id"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    let query =
    {
      store: jsonData.id
    }

    Deal.find(query, (err, result) => cb.callback(res, err, result));
  })


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

  // Disable/Enable deal
  app.put('/deals/disable', async (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_STORE)) {
      return;
    }

    const jsonData = req.body;

    if (!Misc.validObject(jsonData, ["storeID", "dealID"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    try {
      let findRes = await Stat.findById(jsonData.storeID).exec({});
      let retVal = constants.SUCCESS;

      if (!Misc.isEmptyObject(findRes)) {
        let active = findRes.activeDeals;
        let newActive = active.filter(function(value, index, arr) {
          return value !== jsonData.dealID;
        });

        let update = { activeDeals: newActive };

        Stat.findByIdAndUpdate(jsonData.storeID, update, (err, result) => cb.putCallback(res, err, result));
      } else {
        console.log("Stat doesn't exist - also shouldn't ever be here lol.");
        retVal.id = result.id;
        res.send(retVal);
      }
    } catch (err) {
      console.log("Caught error");
      res.send(constants.FAILURE);
    }
  });

  app.put('/deals/enable', async (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_STORE)) {
      return;
    }
    const jsonData = req.body;

    if (!Misc.validObject(jsonData, ["storeID", "dealID"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    try {
      let findRes = await Stat.findById(jsonData.storeID).exec({});
      let retVal = constants.SUCCESS;

      if (!Misc.isEmptyObject(findRes)) {
        let update =
        {
          $push:
          {
            activeDeals: dealID,
          }
        }

        Stat.findByIdAndUpdate(jsonData.storeID, update, (err, result) => cb.putCallback(res, err, result));
      } else {
        console.log("Stat doesn't exist - also shouldn't ever be here lol.");
        retVal.id = result.id;
        res.send(retVal);
      }
    } catch (err) {
      console.log("Caught error");
      res.send(constants.FAILURE);
    }
  });

  app.put('/deals/view', async (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_USER)) {
      return;
    }

    const jsonData = JSON.parse(JSON.stringify(req.query));

    if (!Misc.validObject(jsonData, ["dealID"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    if (!Misc.isValidObjectId(jsonData.dealID)) {
      res.send(constants.ID_ERROR);
      return;
    }
    console.log('valid IDs');

    try {
      let findRes = await Deal.findById(jsonData.dealID).exec({});

      if (!Misc.isEmptyObject(findRes)) {
        let update = { views: findRes.views + 1 };
        Deal.findByIdAndUpdate(jsonData.dealID, update, (err, result) => cb.putCallback(res, err, result));
      } else {
        console.log("Deal doesn't exist - also shouldn't ever be here lol.");
        res.send(constants.FAILURE);
      }
    } catch (err) {
      console.log("Caught error");
      res.send(constants.FAILURE);
    }
  })

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

    if (!Misc.isValidObjectId(jsonData.dealID) || !Misc.isValidObjectId(jsonData.userID)) {
      res.send(constants.ID_ERROR);
      return;
    }
    console.log('valid IDs');

    // Welcome to callback heaven
    Deal.find({_id: jsonData.dealID}, (err, result) => {
      // Check if deal exists
      if (err || result.length === 0) {
        res.send(constants.NOT_FOUND_ERROR);
      } else {
        // Check if user exists
        User.find({_id: jsonData.userID}, (err, result) => {
          if (err || result.length === 0) {
            res.send(constants.NOT_FOUND_ERROR);
          } else if (result[0].dealHistory.indexOf(jsonData.dealID) !== -1) {
            // If this user has already claimed the deal, do not claim it again
            res.send(constants.DUPLICATE_ERROR);
          } else {
            console.log(result[0].dealHistory);
            console.log(result[0].dealHistory.indexOf(jsonData.dealID));
            // Add the deal into the user's deal history and increment the deal's number of claims.
            User.findOneAndUpdate({_id: jsonData.userID}, {$push: {'dealHistory': jsonData.dealID}}, (err, result) => {
              if (err || !result) {
                // Should never get here
                res.send(constants.ERR);
              } else {
                Deal.findOneAndUpdate({_id: jsonData.dealID}, {$inc: {'claims': 1}}, (err, result) => cb.putCallback(res, err, result, null));
              }
            });
          }
        }).limit(1);
      }
    }).limit(1);
  });
};
