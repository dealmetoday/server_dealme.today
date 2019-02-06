const mongoose = require('mongoose')
const Tag = require('../model/tagModel')
const json = require('../data/tags.json')

mongoose.connect('mongodb://localhost/tags', { useNewUrlParser: true })
  .then(() => {
      console.log('Connected to Tags Database.');
      mongoose.connection.db.dropDatabase();

      loadTags();
  })
  .catch(err => console.log('Tags could not connect.', err))

function loadTags() {
  // Get data from tags.json and insert into the database
  for (var index in json) {
    var currObj = json[index];
    var newObj = new Tag({ _id: currObj.id, key: currObj.tag});
    newObj.save();
  }

  console.log('Finished populating the Tags database.');
}

module.exports = mongoose;
