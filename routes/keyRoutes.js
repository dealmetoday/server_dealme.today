const fs = require('fs')
const Utils = require('./utils')

module.exports = function(app) {
  // Initialize keys
  let pubKey = null;
  
  try {
    pubKey = fs.readFileSync('./config/keys/public_key.pem', 'utf8');
  } catch (err) {
    console.log("Could not read public key from the server");
  }

  // Read
  app.get('/pubkey', function(req, res) {
    console.log(pubKey);
    res.send(pubKey);
  });
};
