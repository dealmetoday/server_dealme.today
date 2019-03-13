const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs');
const crypto = require('crypto')
//const argon2 = require('argon2')
const constants = require('../config/constants')

let encrypt = (input) => {
  var publicKey = fs.readFileSync(constants.PUBLIC_KEY_PATH, "utf8");
  var buffer = Buffer.from(input);
  let options =
  {
    'key': publicKey,
    'padding': crypto.constants.RSA_PKCS1_PADDING
  };
  var encrypted = crypto.publicEncrypt(options, buffer);
  return encrypted.toString("base64");
};

let decrypt = (input) => {
  var privateKey = fs.readFileSync(constants.PRIVATE_KEY_PATH, "utf8");
  var buffer = Buffer.from(input, "base64");
  let options =
  {
    'key': privateKey,
    'padding': crypto.constants.RSA_PKCS1_PADDING
  };
  var decrypted = crypto.privateDecrypt(options, buffer);
  return decrypted.toString("utf8");
};

let hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, constants.BCRYPT_ROUNDS);
  } catch (err) {
    return null;
  }
}

let verifyPassword = async (User, Auth, email, password) => {
  console.log("Finding user");
  console.log("\tEmail:    " + email);
  console.log("\tPassword: " + password);

  var authResult;
  var userResult;

  // Verify and get the user given their email
  try {
    userResult = await User.find({'email': email}).cursor().next();
  } catch (err) {
    console.log("Error trying to find user with email '" + email + "'");
    console.log(err);
    return false;
  }
  if (!userResult) {
    console.log("Could not find user with email '" + email + "'");
    return false;
  }

  // Get that user's auth entry
  try {
    authResult = await Auth.findById(userResult._id).cursor().next();
  } catch (err) {
    console.log("Error trying to find user with id '" + userResult._id + "'");
    console.log(err);
    return false;
  }
  if (!authResult) {
    console.log("Could not find auth entry for userID '" + userResult._id + "'");
    return false;
  }

  // Verify the provided password with the database hash
  const verified = await bcrypt.compare(password, authResults.password);
  if (verified) {
    return true;
  }
  return false;
};

let otherVerify = async (password, hashed) => {
  return await bcrypt.compare(password, hashed);
}

module.exports = {
  encrypt,
  decrypt,
  hashPassword,
  verifyPassword,
  otherVerify
}
