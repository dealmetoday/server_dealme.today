const JWT = require('../utils/jwt');
const mongoose = require('mongoose');
const Misc = require('../utils/misc');
const cb = require('../utils/callbacks');
const constants = require('../config/constants');

var Stat = null;

module.exports = (app, dealsDB) => {
  // Setting constructor
  Stat = dealsDB.Stats;

  // Read
  app.get('/stats', (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_STORE)) {
      return;
    }

    const jsonData = JSON.parse(JSON.stringify(req.query));

    if (!Misc.validObject(jsonData, ["id"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    Stat.findById(jsonData.id, (err, result) => cb.callback(res, err, result));
  });

  // Increment customer for store
  app.put('/stats/customer', async (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_STORE)) {
      return;
    }

    if (!Misc.validObject(jsonData, ["id"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    try {
      let findRes = await Stat.findById(jsonData.id).exec({});
      let retVal = constants.SUCCESS;

      if (!Misc.isEmptyObject(findRes)) {
        let update = {};
        let date = new Date();

        update.customersToday = jsonData.today;
        update.customersMonth = date.getMonth() + 1 === findRes.currMonth ? findRes.customersMonth + jsonData.today : jsonData.today
        update.customersTotal = findRes.customersTotal + jsonData.today;

        Stat.findByIdAndUpdate(jsonData.id, update, (err, result) => cb.putCallback(res, err, result));
      } else {
        console.log("Stat doesn't exist - also shouldn't ever be here lol.");
        retVal.id = result.id;
        res.send(retVal);
      }
    } catch (err) {
      console.log("Caught error");
      res.send(constants.FAILURE);
    }
  });
};
