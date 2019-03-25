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

  // Updating day and month
  app.put('/stats/update', async (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_STORE)) {
      return;
    }

    const jsonData = req.body;

    if (!Misc.validObject(jsonData, ["id", "day", "month", "year"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    try {
      let findRes = await Stat.findById(jsonData.id).exec({});

      if (!Misc.isEmptyObject(findRes)) {
        let update =
        {
          currDay: jsonData.day,
          currMonth: jsonData.month,
          currYear: jsonData.year
        }

        if (jsonData.day !== findRes.currDay) {
          update.customersWeek = Misc.shiftArr(findRes.customersWeek, 0);
          update.viewsWeek = Misc.shiftArr(findRes.viewsWeek, 0);
          update.claimsWeek = Misc.shiftArr(findRes.claimsWeek, 0);
        }

        if (jsonData.month !== findRes.currMonth) {
          update.customersMonth = 0;
          update.viewsMonth = 0;
          update.claimsMonth = 0;
        }

        Stat.findByIdAndUpdate(jsonData.id, update, (err, result) => cb.putCallback(res, err, result));
      } else {
        console.log("Stat doesn't exist - also shouldn't ever be here lol.");
        res.send(constants.FAILURE);
      }
    } catch (err) {
      console.log("Caught error");
      res.send(constants.FAILURE);
    }
  })

  // Increment customer for store
  app.put('/stats/customer', async (req, res) => {
    if (!JWT.verify(req.get("Bearer"), constants.JWT_USER)) {
      return;
    }

    const jsonData = req.body;

    // Assumes that /stats/update was called first
    if (!Misc.validObject(jsonData, ["id"])) {
      res.send(constants.ARGS_ERROR);
      return;
    }

    try {
      let findRes = await Stat.findById(jsonData.id).exec({});

      if (!Misc.isEmptyObject(findRes)) {
        let update = {};
        let week = findRes.customersWeek;
        week[0] += 1;

        update.customersWeek = week;
        update.customersMonth = findRes.customersMonth + 1;
        update.customersTotal = findRes.customersTotal + 1;

        Stat.findByIdAndUpdate(jsonData.id, update, (err, result) => cb.putCallback(res, err, result));
      } else {
        console.log("Stat doesn't exist - also shouldn't ever be here lol.");
        res.send(constants.FAILURE);
      }
    } catch (err) {
      console.log("Caught error");
      res.send(constants.FAILURE);
    }
  });
};
