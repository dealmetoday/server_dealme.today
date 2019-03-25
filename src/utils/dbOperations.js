const mongoose = require('mongoose')
const Misc = require('../utils/misc');
const authJSON = require('../data/auth.json')
const dealsJSON = require('../data/deals.json')
const mallsJSON = require('../data/malls.json')
const tagsJSON = require('../data/tags.json')
const usersJSON = require('../data/users.json')
const constants = require('../config/constants')

// For views, claims, and customers: value is total, make up today and month
let storeID = [];
let allDeals = {};
let activeDeals = {};
let allViews = {};
let allClaims = {};
let allCustomers = {};

let loadAll = async (databases) => {
  let userAuth = databases.authDB.UserAuths;
  let storeAuth = databases.authDB.StoreAuths;
  let Deal = databases.dealsDB.Deals;
  let Mall = databases.mallsDB.Malls;
  let Store = databases.mallsDB.Stores;
  let Tag = databases.usersDB.Tags;
  let User = databases.usersDB.Users;
  let Stat = databases.dealsDB.Stats;

  // First delete everything
  await deleteAll(databases);

  // Then load it all
  loadAuth(userAuth, storeAuth);
  loadMalls(Mall, Store);
  loadDeals(Deal);
  loadTags(Tag);
  loadUsers(User);
  loadStats(Stat);
}

let deleteAll = async (databases) => {
  let userAuth = databases.authDB.UserAuths;
  let storeAuth = databases.authDB.StoreAuths;
  let Deal = databases.dealsDB.Deals;
  let Mall = databases.mallsDB.Malls;
  let Store = databases.mallsDB.Stores;
  let Tag = databases.usersDB.Tags;
  let User = databases.usersDB.Users;
  let Stat = databases.dealsDB.Stats;

  await userAuth.deleteMany({}).exec();
  await storeAuth.deleteMany({}).exec();
  await Deal.deleteMany({}).exec();
  await Mall.deleteMany({}).exec();
  await Store.deleteMany({}).exec();
  await Tag.deleteMany({}).exec();
  await User.deleteMany({}).exec();
  await Stat.deleteMany({}).exec();
}

let loadAuth = (userAuth, storeAuth) => {
  // Get data from auth.json and insert into the database
  let totalUser = 0;
  let totalStore = 0;

  for (var index in authJSON) {
    var currObj = authJSON[index];
    var newObj = null;

    let auth = null;
    if (currObj.role === constants.JWT_USER) {
      totalUser += 1;
      auth = userAuth;
    } else if (currObj.role === constants.JWT_STORE) {
      totalStore += 1;
      auth = storeAuth;
    }

    newObj = new auth(
      {
      _id: currObj.id,
      role: currObj.role,
      password: currObj.password
    });

    newObj.save();
  }

  console.log(totalUser)
  console.log(totalStore)
  console.log('Finished populating the Auth database.');
}

let loadDeals =  (Deal) => {
  // Get data from tags.json and insert into the database
  for (var index in dealsJSON) {
    var currObj = dealsJSON[index];
    var newObj = new Deal({
      _id: currObj.id,
      tags: currObj.tags,
      isActive: currObj.isActive,
      description: currObj.description,
      creationDate: Misc.createDate(currObj.creationDate),
      expiryDate: Misc.createDate(currObj.expiryDate),
      format: currObj.format,
      usesLeft: currObj.usesLeft,
      views: currObj.views,
      claims: currObj.claims,
      mall: currObj.mall,
      store: currObj.store
    })

    newObj.save();

    allDeals[currObj.store].push(currObj.id);
    if (currObj.isActive) {
      activeDeals[currObj.store].push(currObj.id);
    }
    allViews[currObj.store] += currObj.views;
    allClaims[currObj.store] += currObj.claims;
    allCustomers[currObj.store] += Math.abs(currObj.views - currObj.claims);
  }

  console.log('Finished populating the Deals database.');
}

let loadMalls =  (Mall, Store) => {
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

      var newStore = new Store({
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

      storeID.push(currStore.id);
      allDeals[currStore.id] = [];
      activeDeals[currStore.id] = [];
      allViews[currStore.id] = 0;
      allClaims[currStore.id] = 0;
      allCustomers[currStore.id] = 0;
    }

    newMall.save();
  }

  console.log('Finished populating the Malls database.');
}

let loadTags =  (Tag) => {
  // Get data from tags.json and insert into the database
  for (var index in tagsJSON) {
    var currObj = tagsJSON[index];
    var newObj = new Tag({ _id: currObj.id, key: currObj.tag});

    newObj.save();
  }

  console.log('Finished populating the Tags database.');
}

let loadUsers =  (User) => {
  // Get data from users.json and insert into the database
  for (var index in usersJSON) {
    let token = -1;
    var currObj = usersJSON[index];

    if (currObj.token != null) {
      token = currObj.token;
    }

    var newObj = new User(
      {
       _id: currObj.id,
       email: currObj.email,
       first: currObj.first,
       last: currObj.last,
       token: token,
       provider: currObj.provider,
       age: currObj.age,
       gender: currObj.gender,
       location: currObj.location,
       tags: currObj.tags
     });

    newObj.save();
  }

  console.log('Finished populating the User database.');
}

let loadStats =  (Stat) => {
  let date = new Date();

  for (var index in storeID) {
    let currID = storeID[index];
    let totalClaims = allClaims[currID];
    let totalViews = allViews[currID];
    let totalCustomers = allCustomers[currID];

    // Randomlly generate stuff
    let monthClaims = Math.floor(totalClaims / 2);
    let monthViews =  Math.floor(totalViews / 2);
    let monthCustomers =  Math.floor(totalCustomers / 2);

    let dayClaims =  Math.floor(monthClaims / 25);
    let dayViews =  Math.floor(monthViews / 25);
    let dayCustomers =  Math.floor(monthCustomers / 25);

    let weekClaims = [];
    let weekViews = [];
    let weekCustomers = [];

    for (var i = 0; i < 7; i++) {
      let mod = Math.pow(-1, i)*i;

      let modClaims = dayClaims + mod;
      let modViews = dayViews + mod;
      let modCustomers = dayCustomers + mod;

      weekClaims.push(modClaims > 0 ? modClaims : 1);
      weekViews.push(modViews > 0 ? modViews : 1);
      weekCustomers.push(modCustomers > 0 ? modCustomers : 1);
    }

    let newStat = new Stat({
      _id: currID,
      activeDeals: activeDeals[currID],
      allDeals: allDeals[currID],
      currDay: date.getDay(),
      currMonth: date.getMonth() + 1,
      currYear: date.getFullYear(),
      claimsWeek: weekClaims,
      claimsMonth: monthClaims,
      claimsTotal: totalClaims,
      viewsWeek: weekViews,
      viewsMonth: monthViews,
      viewsTotal: totalViews,
      customersWeek: weekCustomers,
      customersMonth: monthCustomers,
      customersTotal: totalCustomers,
    });

    newStat.save();
  }

  console.log('Finished populating the Stats database.');
}

module.exports = {
  loadAll,
  deleteAll
}
