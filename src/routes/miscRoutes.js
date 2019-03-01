const JWT = require('../utils/jwt');
const Security = require('../utils/security');
const constants = require('../config/constants');
const DBOperations = require('../utils/dbOperations');

module.exports = (app, databases) => {
  app.get('/init', (req, res) => {
    if (!JWT.verify(req.get("Bearer", constants.JWT_DEV))) {
      return;
    }

    DBOperations.loadAll(databases);
    res.send(constants.SUCCESS);
  });

  app.get('/drop', (req, res) => {
    if (!JWT.verify(req.get("Bearer", constants.JWT_DEV))) {
      return;
    }

    DBOperations.deleteAll(databases);
    res.send(constants.SUCCESS);
  });

  app.get('/bearer', (req, res) => {
    const jsonData = JSON.parse(JSON.stringify(req.query));

    let result = {};
    let val = null;

    switch (jsonData.access) {
      case constants.JWT_DEV:
      case constants.JWT_USER:
      case constants.JWT_STORE:
        val = JWT.sign(jsonData);
        break;
      default:
        val = "Invalid Access."
        break;
    }

    result[constants.BEARER] = val;
    res.send(result)
  });

  app.get('/test/encrypt', (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_DEV)) {
      return;
    }

    const toencrypt = req.body;
    if (!toencrypt.data) {
      return res.send(constants.AUTH_ERROR_NO_PASSWORD);
    }
    res.send({encrypted: Security.encrypt(toencrypt.data)});
  });

  app.get('/test/hash', (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_DEV)) {
      return;
    }

    const tohash = req.body;
    if (!tohash.data) {
      return res.send(constants.AUTH_ERROR_NO_PASSWORD);
    }

    Security.hashPassword(tohash.data).then(hashedData => {
      return res.send({hashed: hashedData});
    }).catch(err => {
      console.log(err);
      return res.send(constants.ERR);
    });
  });

  app.get('/test/auth', (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_DEV)) {
      return;
    }

    result = {};

    let password = "my name is jeff";

    let ePw = Security.encrypt(password);
    let dPw = Security.decrypt(ePw);

    if (password.localeCompare(dPw) == 0) {
      result.encryption = "Encryption works :)"
    }  else {
      result.encryption = "Encryption doesn't works :("
    }

    console.log(ePw + "\n");

    let hashed = Security.hashPassword(password);
    hashed.then((data) => {
      console.log("Hashed Password: " + data);
    })

    res.send(result);
  });

  app.get('/test/basic', (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_DEFAULT)) {
      return;
    }

    res.send(constants.SUCCESS);
  });
};
