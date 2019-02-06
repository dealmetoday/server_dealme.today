const mongoose = require('mongoose')
const constants = require('constants')

const Schema = mongoose.Schema;
const ID = Schema.Types.ObjectId;

module.exports = {
  authDB: {
    UserAuth: new Schema({
      _id: ID,
      role: String,
      password: String
    }),

    StoreAuth: new Schema({
      _id: ID,
      role: String,
      password: String
    })
  },

  checkInDB: {
    CheckIn: new Schema({
      time: Date,
      mall: ID,
      user: ID
    })
  },

  dealsDB: {
    Deal: new Schema({
      id: ID,
      tags: [ID],
      isActive: Boolean,
      description: String,
      creationDate: Date,
      expiryDate: Date,
      format: String,
      usesLeft: Number,
      views: Number,
      claims: Number,
      mall: ID,
      store: ID
    })
  },

  mallsDB: {
    Mall: new Schema({
        _id: ID,
        address: String,
        name: String,
        tags: [ID],
        numOfStores: Number
      }),

    Store: new Schema({
      _id: ID,
      mall: ID,
      location: [Number],
      name: String,
      email: String,
      tags: [ID],
      description: String,
      parentCompany: String
    })
  },

  tagsDB: {
    Tag: new Schema({
      _id: ID,
      key: String
    })
  },

  usersDB: {
    User: new Schema({
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
    })
  }
}
