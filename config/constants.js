const argon2 = require('argon2')

module.exports = Object.freeze({
  TAGS: 'TAGS',
  MALLS: 'MALLS',
  USERS: 'USERS',
  STORES: 'STORES',
  CHECKIN: 'CHECKIN',
  DEALS: 'DEALS',
  USER_AUTH: 'USER_AUTH',
  STORE_AUTH: 'STORE_AUTH',
  PRIVATE_KEY_PATH: './config/keys/private_key.pem',
  PUBLIC_KEY_PATH: './config/keys/public_key.pem',
  ARGON2_PROPERTIES:
  {
    type: argon2.argon2d,
    memoryCost: 2048,     // 2MB per thread
    parallelism: 8,       // 8 threads (32MB RAM per hash)
    hashLength: 50,
  },
  ERR:
  {
    "Error" : "An error has occured"
  },
  ID_ERROR:
  {
    "Error" : "Input ID is not a valid ObjectID"
  },
  NOT_FOUND_ERROR:
  {
    "Error" : "Given ID does not exist in the database"
  },
  DUPLICATE_ERROR:
  {
    "Error" : "Performed duplicate action"
  },
});
