const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const argon2 = require('argon2')
const constants = require('../config/constants')

let encrypt = (input) => {
  var publicKey = fs.readFileSync(constants.PUBLIC_KEY_PATH, "utf8");
  var buffer = Buffer.from(input);
  var encrypted = crypto.publicEncrypt(publicKey, buffer);
  return encrypted.toString("base64");
};

let decrypt = (input) => {
  var privateKey = fs.readFileSync(constants.PRIVATE_KEY_PATH, "utf8");
  var buffer = Buffer.from(input, "base64");
  var decrypted = crypto.privateDecrypt(privateKey, buffer);
  return decrypted.toString("utf8");
};

let hashPassword = async (password) => {
  try {
    const hash = await argon2.hash(password, constants.ARGON2_PROPERTIES);
    return hash;
  } catch (err) {
    console.log('err.......');
    return null;
  }
}

let verifyPassword = async (User, Auth, email, password) => {
  User.find({'email': email}, async (err, userResult) => {
    if (err) {
      console.log("LELOUCH - I'm at soup!");
      return null;
    } else {
      Auth.findById(userResult[0]._id, async (err, authResult) => {
        if (err) {
          console.log("LELOUCH - I'm at soup!");
          return null;
        } else {
          try {
            const verified = await argon2.verify(authResult.password, password);
            if (verified) {
              return true;
            } else {
              return false;
            }
          } catch (err) {
            return null;
          }
        }
      });
    }
  })
};

module.exports = {
  encrypt,
  decrypt,
  hashPassword,
  verifyPassword
}
