const fs   = require('fs');
const jwt  = require('jsonwebtoken');
const Misc = require('../utils/misc')
const constants = require('../config/constants');

const prvKey = fs.readFileSync(constants.PRIVATE_KEY_PATH, 'utf8');
const pubKey = fs.readFileSync(constants.PUBLIC_KEY_PATH, 'utf8');

let sign = (payload) => {
  let target = constants.AUDIENCE + "/" + payload.access;

  let options = {
    issuer: constants.ISSUER,
    subject: payload.email,
    audience: target,
    expiresIn: "30d", // token is valid for 30 days
    algorithm: "RS256"
  };

  return jwt.sign(payload, prvKey, options);
};

let decode = (token) => {
  return jwt.decode(token, {complete: true});
};

let verify = (token, requiredAccess, storeOrUser = false) => {
  let options = {
    issuer: constants.ISSUER,
    algorithm: "RS256"
  }

  let accessLevel = getAccess(requiredAccess);

  try {
    let verifyStatus = jwt.verify(token, pubKey, options);

    if (!Misc.isEmptyObject(verifyStatus)) {
      let currAccess = getAccess(verifyStatus.access);
      if (currAccess == accessLevel) {
        if (storeOrUser) {
          return true;
        } else {
          return verifyStatus.access == requiredAccess;
        }
      } else {
        return currAccess > accessLevel;
      }
    } else {
      console.log("Bad Bearer");
      return false;
    }
  } catch (err) {
    return false
  }
};

let getAccess = (type) => {
  return constants.JWT_ACCESS[type];
};

module.exports = {
  sign,
  verify,
  decode
}

// let testPayload = {
//   email: 'dio.ryanliu@hotmail.com',
//   id: '5c386f357eb1a4767f9f1bb0',
//   access: constants.JWT_DEV
// };
//
// // Generating token
// let token = sign(testPayload);
// console.log("JWT:\n" + token)
//
// // Decode token
// let decoded = decode(token);
// console.log("Header: ");
// console.log(decoded.header);
// console.log("Payload: ");
// console.log(decoded.payload);
//
// // Verifying token
// let status = verify(token, constants.JWT_USER);
// console.log(status);
