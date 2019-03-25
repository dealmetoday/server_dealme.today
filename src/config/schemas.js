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
    }),

    Request: new Schema({
      _id: ID,
      content: Schema.Types.Mixed
    })
  },

  dealsDB: {
    Deal: new Schema({
      _id: ID,
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
    }),

    Stat: new Schema({
      _id: ID,
      activeDeals: [ID],
      allDeals: [ID],
      currMonth: Number,
      currYear: Number,
      claimsToday: Number,
      claimsMonth: Number,
      claimsTotal: Number,
      viewsToday: Number,
      viewsMonth: Number,
      viewsTotal: Number,
      customersToday: Number,
      customersMonth: Number,
      customersTotal: Number
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

  usersDB: {
    User: new Schema({
      _id: ID,
      email: String,
      first: String,
      middle: String,
      last: String,
      token: Number,
      age: Number,
      gender: String,
      location: String,
      provider: String,
      tags: [ID],
      favouriteMalls: [ID],
      dealHistory: [ID]
    }),

    Tag: new Schema({
      _id: ID,
      key: String
    })
  }
}
