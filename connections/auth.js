const mongoose = require('mongoose')
const constants = require('../config/constants')
const json = require('../data/auth.json')

mongoose.connect('mongodb://localhost/auth', { useNewUrlParser: true })
  .then(() => {
      console.log('Connected to Auth Database.');
      mongoose.connection.db.dropDatabase();

      loadAuth();
  })
  .catch(err => console.log('Auth could not connect.', err))

function loadAuth() {
  // Get data from auth.json and insert into the database
  for (var index in json) {
    var currObj = json[index];
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

module.exports = exports = mongoose;
