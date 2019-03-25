const JWT = require('../utils/jwt');
const cb = require('../utils/callbacks');
const constants = require('../config/constants');

let Request = null;

module.exports = (app, authDB) => {
  // Setting constructor
  Request = authDB.Requests;

  app.get('/request', (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_DEV)) {
      return;
    }

    Request.find((err, result) => cb.callback(res, err, result));
  });
};
