const mongoose = require('mongoose')

const Schema = mongoose.Schema;
const ID = Schema.Types.ObjectId;

var kittySchema = new Schema({
  name: String,
  age: Number
});

kittySchema.methods.speak = function () {
  var greeting = this.name
    ? "Meow name is " + this.name
    : "I don't have a name";
  console.log(greeting);
}

var Kitten = mongoose.model('Kitten', kittySchema);

exports.Kitten = Kitten;

/*******************************************************************************
******************************* Database Schemas *******************************
*******************************************************************************/
// Tags (Interests)
var tagSchema = new Schema({
  _id: ID,
  key: String
});

exports.tagSchema = tagSchema;

// User
var userSchema = new Schema({
  _id: ID,
  email: String,
  first: String,
  middle: String,
  last: String,
  age: Number,
  gender: String,
  location: String,
  tags: [ID],
  favouriteMalls: [ID],
  dealHistory: [ID]
});

exports.userSchema = userSchema;

// Auth
var authSchema = new Schema({
  _id: ID,
  role: String,
  password: String
});

exports.authSchema = authSchema;

// CheckIns
var checkInSchema = new Schema({
  time: Date,
  mall: ID,
  user: ID
});

exports.checkInSchema = checkInSchema;

// Malls and stores
var mallSchema = new Schema({
  _id: ID,
  address: String,
  name: String,
  tags: [ID],
  numOfStores: Number
});

var storeSchema = new Schema({
  _id: ID,
  location: [Number],
  name: String,
  email: String,
  tags: [ID],
  description: String,
  parentCompany: String
});

exports.mallSchema = mallSchema
exports.storeSchema = storeSchema

// Deals
var dealSchema = new Schema({
  id: ID,
  tags: [ID],
  description: String,
  creationDate: Date,
  expiryDate: Date,
  format: String,
  usesLeft: Number,
  views: Number,
  mall: ID,
  store: ID
});

exports.dealSchema = dealSchema
