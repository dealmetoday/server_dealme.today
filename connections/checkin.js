const mongoose = require('mongoose')
const schemas = require('../model/schemas')
const constants = require('../config/constants')
const json = require('../data/checkin.json')

mongoose.connect('mongodb://localhost/checkin', { useNewUrlParser: true })
  .then(() => {
      console.log('Connected to CheckIn Database.');
      mongoose.connection.db.dropDatabase();

      loadCheckin();
  })
  .catch(err => console.log('CheckIn could not connect.', err))

function loadCheckin() {
  // Grabbing the constructors
  var CheckIn = null;

  // Get data from users.json and insert into the database
  for (var index in json) {
    var currObj = json[index];
    mallID = currObj.mall;

    CheckIn = mongoose.model(constants.CHECKIN, schemas.checkInSchema, mallID);

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

module.exports = exports = mongoose;
