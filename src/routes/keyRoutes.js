const fs = require('fs')
const constants = require('../config/constants')

module.exports = (app) => {
  // Initialize keys
  let pubKey = null;

  try {
    pubKey = fs.readFileSync(constants.PUBLIC_KEY_PATH, 'utf8');
  } catch (err) {
    console.log("Could not read public key from the server");
  }

  // Read
  app.get('/pubkey', => (req, res) {
    console.log(pubKey);
    res.send(pubKey);
  });
};
