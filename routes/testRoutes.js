const security = require('../utils/security');

module.exports = function(app) {
  app.get('/test/encrypt', (req, res) => {
    const toencrypt = req.body;
    if (!toencrypt.data) {
      return res.send(constants.AUTH_ERROR_NO_PASSWORD);
    }
    res.send({encrypted: security.encrypt(toencrypt.data)});
  })

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
  })
};
