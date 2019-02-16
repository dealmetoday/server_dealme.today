const mongoose = require('mongoose')
const authJSON = require('../data/auth.json')
const checkinJSON = require('../data/checkin.json')
const dealsJSON = require('../data/deals.json')
const mallsJSON = require('../data/malls.json')
const tagsJSON = require('../data/tags.json')
const usersJSON = require('../data/users.json')
const constants = require('./constants')

var dbs = null;

module.exports = function(databases) {
  dbs = databases;
  loadAuth();
  loadCheckin();
  loadDeals();
  loadMalls();
  loadTags();
  loadUsers();
}

function loadAuth() {
  // Get data from auth.json and insert into the database
  const userAuth = dbs.authDB.UserAuths;
  const storeAuth = dbs.authDB.StoreAuths;

  for (var index in authJSON) {
    var currObj = authJSON[index];
    var newObj = null;

    if (currObj["collection"] === constants.USERS) {
      newObj = new userAuth(
        {
        _id: currObj.id,
        role: currObj.role,
        password: currObj.password
      });
    } else if (currObj["collection"] === constants.STORES) {
      newObj = new storeAuth(
        {
        _id: currObj.id,
        role: currObj.role,
        password: currObj.password
      });
    }

    newObj.save();
  }

  console.log('Finished populating the Auth database.');
}

function loadCheckin() {
  // Grabbing the constructors
  const CheckIn = dbs.checkInDB.CheckIns;

  // Get data from users.json and insert into the database
  for (var index in checkinJSON) {
    var currObj = checkinJSON[index];
    mallID = currObj.mall;

    var newObj = new CheckIn(
      {
        time: currObj.time,
        mall: currObj.mall,
        user: currObj.user
      });

    newObj.save();
  }

  console.log('Finished populating the CheckIn database.');
}

function loadDeals() {
  // Get data from tags.json and insert into the database
  const Deal = dbs.dealsDB.Deals;

  for (var index in dealsJSON) {
    var currObj = dealsJSON[index];
    var newObj = new Deal({
      _id: currObj.id,
      tags: currObj.tags,
      isActive: currObj.isActive,
      description: currObj.description,
      creationDate: currObj.creationDate,
      expiryDate: currObj.expiryDate,
      format: currObj.format,
      usesLeft: currObj.usesLeft,
      views: currObj.views,
      claims: currObj.claims,
      mall: currObj.mall,
      store: currObj.store
    })

    newObj.save();
  }

  console.log('Finished populating the Deals database.');
}

function loadMalls() {
  // Grabbing the constructors
  const Mall = dbs.mallsDB.Malls;
  const Store = dbs.mallsDB.Stores;

  // Get data from users.json and insert into the database
  for (var index in mallsJSON) {
    var currI = mallsJSON[index];
    var currMall = currI[0];
    mallID = currMall.id;

    var newMall = new Mall(
      {
        _id: currMall.id,
        address: currMall.address,
        name: currMall.name,
        tags: currMall.tags,
        numOfStores: currMall.numOfStores
      });

    for (var j = 1; j < currI.length; j++) {
      var currStore = currI[j];

      var newStore = new Store(
        {
          _id: currStore.id,
          mall: currStore.mall,
          location: currStore.location,
          name: currStore.name,
          email: currStore.email,
          tags: currStore.tags,
          description: currStore.description,
          parentCompany: currStore.parentCompany
        });

        newStore.save();
    }

    newMall.save();
  }

  console.log('Finished populating the Malls database.');
}

function loadTags() {
  // Get data from tags.json and insert into the database
  const Tag = dbs.tagsDB.Tags;

  for (var index in tagsJSON) {
    var currObj = tagsJSON[index];
    var newObj = new Tag({ _id: currObj.id, key: currObj.tag});
    newObj.save();
  }

  console.log('Finished populating the Tags database.');
}

function loadUsers() {
  // Get data from users.json and insert into the database
  const User = dbs.usersDB.Users;

  for (var index in usersJSON) {
    var currObj = usersJSON[index];
    var newObj = new User(
      {
       _id: currObj.id,
       email: currObj.email,
       first: currObj.first,
       last: currObj.last,
       age: currObj.age,
       gender: currObj.gender,
       location: currObj.location,
       tags: currObj.tags
     });

    newObj.save();
  }

  console.log('Finished populating the User database.');
}
