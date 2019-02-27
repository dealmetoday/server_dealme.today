const security = require('../utils/security');

module.exports = function(app) {
  app.get('/test/encrypt', (req, res) => {
    const toencrypt = req.body;
    if (!toencrypt.data) {
      return res.send(constants.AUTH_ERROR_NO_PASSWORD);
    }
    res.send({encrypted: security.encrypt(toencrypt.data)});
  });

  app.get('/test/hash', (req, res) => {
    const tohash = req.body;
    if (!tohash.data) {
      return res.send(constants.AUTH_ERROR_NO_PASSWORD);
    }

    security.hashPassword(tohash.data).then(hashedData => {
      return res.send({hashed: hashedData});
    }).catch(err => {
      console.log(err);
      return res.send(constants.ERR);
    });
  });

  app.get('/test/auth', function(req, res) {
    result = {};

    let password = "my name is jeff";

    let ePw = Security.encrypt(password);
    let dPw = Security.decrypt(ePw);

    if (password.localeCompare(dPw) == 0) {
      result.encryption = "Encryption works :)"
    }  else {
      result.encryption = "Encryption doesn't works :("
    }

    let hashed = Security.hashPassword(password);
    hashed.then((data) => {
      console.log("Hashed Password: " + hashed);
    })

    let verifyResult = Security.verifyPassword(User, userAuth, 'mihailo@shaw.ca', password);
    if (verifyResult) {
      result.verify = "yessir";
    } else {
      result.verify = "No ma'am :(";
    }

    res.send(result);
  });

  app.get('/test/basic', function(req, res) {
    console.log("Yes");
    console.log(req.body);
  });
};
