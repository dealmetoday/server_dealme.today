"use strict";

const fs   = require('fs');
const jwt  = require('jsonwebtoken');
const constants = require('../config/constants');

class JWT {
  constructor() {
    this._issuer = "dealme.today";
    this._audience = "api.dealme.today";

    this._prvKey = fs.readFileSync(constants.PRIVATE_KEY_PATH, 'utf8')
    this._pubKey = fs.readFileSync(constants.PUBLIC_KEY_PATH, 'utf8');
  }

  sign(payload) {
    let options = {
      issuer: this._issuer,
      subject: payload.email,
      audience: this._audience,
      expiresIn: "30d", // token is valid for 30 days
      algorithm: "RS256"
    };

    return jwt.sign(payload, this._prvKey, options);
  }

  verify(token, payload) {
    let options = {
      issuer: this._issuer,
      audience: this._audience,
      expiresIn: "30d", // token is valid for 30 days
      algorithm: "RS256"
    }

    try {
      return jwt.verify(token, this._pubKey, options);
    } catch (err) {
      return false
    }
  }

  decode(token) {
    return jwt.decode(token, {complete: true});
  }
}

module.exports = JWT

let tester = new JWT();
let testPayload = {
  email: 'dio.ryanliu@hotmail.com',
  id: '5c386f357eb1a4767f9f1bb0'
};

// Generating token
let token = tester.sign(testPayload);
console.log("JWT:\n" + token)

// Decode token
let decoded = tester.decode(token);
console.log(decoded.header);
console.log(decoded.payload);

// Verifying token
let verify = tester.verify(token);
console.log(verify);
