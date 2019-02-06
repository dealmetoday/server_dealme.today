const mongoose = require('mongoose')
const Deal = require('../model/dealModel')
const json = require('../data/deals.json')

mongoose.connect('mongodb://localhost/deals', { useNewUrlParser: true })
  .then(() => {
      console.log('Connected to Deals Database.');
      mongoose.connection.db.dropDatabase();

      loadDeals();
  })
  .catch(err => console.log('Deals could not connect.', err))

function loadDeals() {
  // Get data from tags.json and insert into the database
  for (var index in json) {
    var currObj = json[index];
    var newObj = new Deal({
      _id: currObj.id,
      tags: currObj.tags,
      description: currObj.description,
      creationDate: currObj.creationDate,
      expiryDate: currObj.expiryDate,
      format: currObj.format,
      usesLeft: currObj.usesLeft,
      views: currObj.views,
      mall: currObj.mall,
      store: currObj.store
    })

    newObj.save();
  }

  console.log('Finished populating the Deals database.');
}

module.exports = mongoose;
