const mongoose = require('mongoose')
const User = require('../model/userModel')
const json = require('../data/users.json')

mongoose.connect('mongodb://localhost/users', { useNewUrlParser: true })
  .then(() => {
      console.log('Connected to User Database.');
      mongoose.connection.db.dropDatabase();

      loadUsers();
  })
  .catch(err => console.log('User could not connect.', err))

function loadUsers() {
  // Get data from users.json and insert into the database
  for (var index in json) {
    var currObj = json[index];
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

module.exports = exports = mongoose;
