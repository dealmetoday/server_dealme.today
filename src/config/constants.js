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
  ISSUER: 'dealme.today',
  AUDIENCE: 'api.dealme.today',
  BEARER: 'Bearer',
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
  AUTH_ERROR_NO_EMAIL:
  {
    "Error" : "Must provide email when logging in or signing up"
  },
  AUTH_ERROR_NO_PASSWORD:
  {
    "Error" : "Must provide password when logging in or signing up"
  },
  AUTH_ERROR_INVALID:
  {
    "Error" : "Email or password provided is invalid"
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
  SUCCESS:
  {
    "status" : "Success"
  },
  FAILURE:
  {
    "status": "Failed. Check your input."
  }
});
