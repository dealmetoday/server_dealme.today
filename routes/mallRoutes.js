const mongoose = require('mongoose')
const Utils = require('./utils')
const constants = require('../config/constants')

var Mall = null;
var Store = null;

module.exports = function(app, mallsDB) {
  // Setting constructor
  Mall = mallsDB.Malls;
  Store = mallsDB.Stores;

  /****************************************************************************/
  // Create
  app.post('/malls', function(req, res) {
    const jsonData = req.body;
    const newID = mongoose.Types.ObjectId();

    var newObj = new Mall(
      {
        _id: newID,
        address: jsonData.address,
        name: jsonData.name,
        tags: jsonData.tags,
        numOfStores: jsonData.numOfStores
      });

    newObj.save((err, result) => Utils.callBack(res, err, result));
  });

  // Read
  app.get('/malls', function(req, res) {
    const jsonData = req.body;

    if (Utils.isEmptyObject(jsonData)) {
      Mall.find((err, result) => Utils.callBack(res, err, result));
    } else {
      var query =
      {
        "tags":
        {
          $all : jsonData.tags
        }
      }
      Mall.find(query, (err, result) => Utils.callBack(res, err, result));
    }
  });

  // Update
  app.put('/malls', function(req, res) {
    const jsonData = req.body;
    var id = jsonData.id;
    delete jsonData.id;

    Mall.findByIdAndUpdate(id, jsonData, (err, result) => Utils.putCallback(res, err, result));
  });

  // delete
  app.delete('/malls', function(req, res) {
    const jsonData = req.body;

    Mall.findByIdAndDelete(jsonData.id, (err, result) => Utils.callBack(res, err, result));
  });

  /****************************************************************************/
  // Create
  app.post('/stores', function(req, res) {
    const jsonData = req.body;
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

    newObj.save((err, result) => Utils.callBack(res, err, result));
  });

  // Read
  app.get('/stores', function(req, res) {
    const jsonData = req.body;

    // Default distance of 100m
    var closestDistance = 100;
    var closestMallID = null;

    // Get the Mall that you are close to
    Mall.find((err, result) => {
      if (err) {
        res.send(constants.ERR);
      }

      // Does not work without Google API to convert address to Lat Long
      // for (var key in result) {
      //   var currObj = result[key];
      //   var currDistance = getDistance(jsonData.location, currObj.location)
      //   if (currDistance < closestDistance) {
      //     closestDistance = currDistance;
      //     closestMallID = currObj["_id"];
      //   }
      // }

      // Hardcoded to Pacific Center mall instead
      for (var key in result) {
        var currObj = result[key];

        if (currObj.name == "Pacific Center") {
          closestMallID = currObj["_id"];
        }
      }

      // If tags exist, then return stores that have tags user is interested in
      // Else, return all stores
      var query =
      {
        mall: closestMallID
      };

      if ("tags" in jsonData) {
        query.tags = {
          $all : jsonData.tags
        }
      }

      Store.find(query, (err, result) => Utils.callBack(res, err, result));
    });
  });

  // Update
  app.put('/stores', function(req, res) {
    const jsonData = req.body;

    // Retrieve constructor for model based on which Mall the store falls under
    const storeID = jsonData.store;
    delete jsonData.store;

    Store.findByIdAndUpdate(storeID, jsonData, (err, result) => Utils.putCallback(res, err, result));
  });

  // delete
  app.delete('/stores', function(req, res) {
    const jsonData = req.body;

    // Retrieve constructor for model based on which Mall the store falls under
    const mallID = jsonData.mall;
    const Store = mallIDToModel[mallID];

    Store.findByIdAndDelete(jsonData.store, (err, result) => Utils.callBack(res, err, result));
  });
};

// Use Google API later on
function getDistance(arr1, arr2) {
  var p1 = { lat: arr1[0], long: arr1[1] };
  var p2 = { lat: arr2[0], long: arr2[1] };

  return haversine(p1, p2);
}

var rad = function(x) {
  return x * Math.PI / 180;
};

var haversine = function(p1, p2) {
  var R = 6378137; // Earth’s mean radius in meter
  var dLat = rad(p2.lat - p1.lat);
  var dLong = rad(p2.long - p1.long);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d; // returns the distance in meter
};
