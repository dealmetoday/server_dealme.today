const mongoose = require('mongoose')
const authJSON = require('../data/auth.json')
const dealsJSON = require('../data/deals.json')
const mallsJSON = require('../data/malls.json')
const tagsJSON = require('../data/tags.json')
const usersJSON = require('../data/users.json')
const constants = require('../config/constants')

let loadAll = async (databases) => {
  let userAuth = databases.authDB.UserAuths;
  let storeAuth = databases.authDB.StoreAuths;
  let Deal = databases.dealsDB.Deals;
  let Mall = databases.mallsDB.Malls;
  let Store = databases.mallsDB.Stores;
  let Tag = databases.tagsDB.Tags;
  let User = databases.usersDB.Users;

  // First delete everything
  await deleteAll(databases);

  // Then load it all
  loadAuth(userAuth, storeAuth);
  loadDeals(Deal);
  loadMalls(Mall, Store);
  loadTags(Tag);
  loadUsers(User);
}

let deleteAll = async (databases) => {
  let userAuth = databases.authDB.UserAuths;
  let storeAuth = databases.authDB.StoreAuths;
  let Deal = databases.dealsDB.Deals;
  let Mall = databases.mallsDB.Malls;
  let Store = databases.mallsDB.Stores;
  let Tag = databases.tagsDB.Tags;
  let User = databases.usersDB.Users;

  await userAuth.deleteMany({}).exec();
  await storeAuth.deleteMany({}).exec();
  await Deal.deleteMany({}).exec();
  await Mall.deleteMany({}).exec();
  await Store.deleteMany({}).exec();
  await Tag.deleteMany({}).exec();
  await User.deleteMany({}).exec();
}

let loadAuth = (userAuth, storeAuth) => {
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

let loadDeals = (Deal) => {
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

let loadMalls = (Mall, Store) => {
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

let loadTags = (Tag) => {
  // Get data from tags.json and insert into the database
  for (var index in tagsJSON) {
    var currObj = tagsJSON[index];
    var newObj = new Tag({ _id: currObj.id, key: currObj.tag});
    newObj.save();
  }

  console.log('Finished populating the Tags database.');
}

let loadUsers = (User) => {
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

module.exports = {
  loadAll,
  deleteAll
}
