const mongoose = require('mongoose')
const authJSON = require('../data/auth.json')
const checkinJSON = require('../data/checkin.json')
const dealsJSON = require('../data/deals.json')
const mallsJSON = require('../data/malls.json')
const tagsJSON = require('../data/tags.json')
const usersJSON = require('../data/users.json')
const constants = require('./constants')

var dbs = null;
var userAuth = null;
var storeAuth = null;
var CheckIn = null;
var Deal = null;
var Mall = null;
var Store = null;
var Tag = null;
var User = null;

module.exports = function(databases) {
  dbs = databases;

  userAuth = dbs.authDB.UserAuths;
  storeAuth = dbs.authDB.StoreAuths;
  CheckIn = dbs.checkInDB.CheckIns;
  Deal = dbs.dealsDB.Deals;
  Mall = dbs.mallsDB.Malls;
  Store = dbs.mallsDB.Stores;
  Tag = dbs.tagsDB.Tags;
  User = dbs.usersDB.Users;

  let deletePromise = deleteAll();
  deletePromise.then(() => {
    loadAuth();
    loadCheckin();
    loadDeals();
    loadMalls();
    loadTags();
    loadUsers();
  })
}

let deleteAll = async () => {
  await userAuth.deleteMany({}).exec();
  await storeAuth.deleteMany({}).exec();
  await CheckIn.deleteMany({}).exec()
  await Deal.deleteMany({}).exec();
  await Mall.deleteMany({}).exec();
  await Store.deleteMany({}).exec();
  await Tag.deleteMany({}).exec();
  await User.deleteMany({}).exec();
}

function loadAuth() {
  // Get data from auth.json and insert into the database
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
  for (var index in tagsJSON) {
    var currObj = tagsJSON[index];
    var newObj = new Tag({ _id: currObj.id, key: currObj.tag});
    newObj.save();
  }

  console.log('Finished populating the Tags database.');
}

function loadUsers() {
  // Get data from users.json and insert into the database
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
