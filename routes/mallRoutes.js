const mongoose = require('mongoose')
const Misc = require('../utils/misc')
const cb = require('../utils/callbacks')
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

    newObj.save((err, result) => cb.callback(res, err, result));
  });

  // Read
  app.get('/malls', function(req, res) {
    const jsonData = req.body;

    if (Misc.isEmptyObject(jsonData)) {
      Mall.find((err, result) => cb.callback(res, err, result));
    } else {
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
  app.put('/malls', function(req, res) {
    const jsonData = req.body;
    var id = jsonData.id;
    delete jsonData.id;

    Mall.findByIdAndUpdate(id, jsonData, (err, result) => cb.putCallback(res, err, result));
  });

  // delete
  app.delete('/malls', function(req, res) {
    const jsonData = req.body;

    Mall.findByIdAndDelete(jsonData.id, (err, result) => cb.callback(res, err, result));
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

    // TODO: Create entry in Auth database too
    newObj.save((err, result) => cb.callback(res, err, result));
  });

  // Read
  app.get('/stores', function(req, res) {
    const jsonData = req.body;

    Store.find((err, result) => cb.callback(res, err, result));
  });

  // Update
  app.put('/stores', function(req, res) {
    const jsonData = req.body;

    // Retrieve constructor for model based on which Mall the store falls under
    const storeID = jsonData.store;
    delete jsonData.store;

    Store.findByIdAndUpdate(storeID, jsonData, (err, result) => cb.putCallback(res, err, result));
  });

  // delete
  app.delete('/stores', function(req, res) {
    const jsonData = req.body;

    // Retrieve constructor for model based on which Mall the store falls under
    const mallID = jsonData.mall;
    const Store = mallIDToModel[mallID];

    Store.findByIdAndDelete(jsonData.store, (err, result) => cb.callback(res, err, result));
  });
};
