const fs   = require('fs');
const jwt  = require('jsonwebtoken');
const Misc = require('../utils/misc')
const constants = require('../config/constants');

const prvKey = fs.readFileSync(constants.PRIVATE_KEY_PATH, 'utf8');
const pubKey = fs.readFileSync(constants.PUBLIC_KEY_PATH, 'utf8');

let sign = (payload) => {
  let options = {
    issuer: constants.ISSUER,
    subject: payload.email,
    audience: constants.AUDIENCE,
    expiresIn: "30d", // token is valid for 30 days
    algorithm: "RS256"
  };

  return jwt.sign(payload, prvKey, options);
};

let verify = (token) => {
  let options = {
    issuer: constants.ISSUER,
    audience: constants.AUDIENCE,
    expiresIn: "30d", // token is valid for 30 days
    algorithm: "RS256"
  }

  try {
    let verifyStatus = jwt.verify(token, pubKey, options);
    if (!Misc.isEmptyObject(verifyStatus)) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false
  }
};

let decode = (token) => {
  return jwt.decode(token, {complete: true});
};

module.exports = {
  sign,
  verify,
  decode
}

// let testPayload = {
//   email: 'dio.ryanliu@hotmail.com',
//   id: '5c386f357eb1a4767f9f1bb0'
// };
// 
// // Generating token
// let token = sign(testPayload);
// console.log("JWT:\n" + token)
//
// // Decode token
// let decoded = decode(token);
// console.log(decoded.header);
// console.log(decoded.payload);
//
// // Verifying token
// let status = verify(token);
// console.log(status);
