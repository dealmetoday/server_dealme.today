// const argon2 = require('argon2')

module.exports = Object.freeze({
  // Database constants
  TAGS: 'TAGS',
  MALLS: 'MALLS',
  USERS: 'USERS',
  STORES: 'STORES',
  CHECKIN: 'CHECKIN',
  DEALS: 'DEALS',
  USER_AUTH: 'USER_AUTH',
  STORE_AUTH: 'STORE_AUTH',

  // JWT constants
  BEARER: 'Bearer',
  ISSUER: 'dealme.today',
  JWT_USER: 'user',
  JWT_STORE: 'store',
  JWT_DEV: 'developer',
  JWT_DEFAULT: 'default',
  AUDIENCE: 'api.dealme.today',

  // JWT Access Levels
  JWT_ACCESS:
  {
    'user': 1,
    'store': 1,
    'developer': 2,
    'default': 0
  },

  // Permission keys
  PRIVATE_KEY_PATH: './src/config/keys/private_key.pem',
  PUBLIC_KEY_PATH: './src/config/keys/public_key.pem',

  // Hashing constants
  BCRYPT_ROUNDS: 10,

  // ARGON2_PROPERTIES:
  // {
  //   type: argon2.argon2d,
  //   memoryCost: 2048,     // 2MB per thread
  //   parallelism: 8,       // 8 threads (32MB RAM per hash)
  //   hashLength: 50,
  // },

  // Message constants
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
  ARGS_ERROR:
  {
    "Error" : "Check your arguments"
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
    "status": "Internal Failure."
  },
  REQUESTED:
  {
    "status": "Your request has been submitted."
  }
});
