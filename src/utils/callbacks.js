const JWT = require('../utils/jwt');
const Misc = require('../utils/misc');
const Security = require('../utils/security');
const constants = require('../config/constants');

let callback = (res, err, output) => {
  if (err) {
    res.send(constants.ERR);
  } else {
    let result = checkResult(output);
    res.send(result);
  }
};

let regCallback = (res, err, output) => {
  if (err) {
    console.log(err);
    res.send(constants.ERR);
  } else {
    let result = checkResult(output);
    if (result == constants.FAILURE) {
      res.send(result);
    } else {
      res.send(constants.SUCCESS);
    }
  }
}

let putCallback = (res, err, output) => {
  if (err) {
    res.send(constants.ERR);
  }
  else {
    let result = checkResult(output);
    res.send(result);
  }
};

let getArrCallback = (res, err, output) => {
  if (err) {
    res.send(constants.ERR);
  }
  else {
    let result = checkResult(output);
    res.send(result);
  }
};

let getObjCallback = (res, err, output) => {
  if (err) {
    res.send(constants.ERR);
  }
  else {
    let result = checkResult(output[0]);
    res.send(result);
  }
};

let socialCallback = (res, err, output, email) => {
  if (err) {
    return;
  } else {
    let payload = {};
    payload.id = output._id;
    payload.email = email;
    payload.access = constants.JWT_USER;

    let retVal = constants.SUCCESS;
    retVal[constants.BEARER] = JWT.sign(payload);
    res.send(retVal);
  }
};

let emailCallback = async (res, err, output, role, password, email) => {
  if (err) {
    return;
  } else {
    let hashed = output.password;
    let verifyResult = await Security.otherVerify(password, hashed);

    if (verifyResult) {
      let payload = {};
      payload.id = output._id;
      payload.email = email;
      payload.access = role;

      let retVal = constants.SUCCESS;
      retVal[constants.BEARER] = JWT.sign(payload);
      retVal['id'] = payload.id
      res.send(retVal);
    } else {
      res.send(constants.FAILURE);
    }
  }
};

let reqCallback = (res, err, output) => {
  if (err) {
    res.send(constants.ERR);
  } else {
    let result = checkResult(output);
    if (result == constants.FAILURE) {
      res.send(result);
    } else {
      res.send(constants.REQUESTED);
    }
  }
}

let storeCheckCallback = (res, err, output) => {
  if (err) {
    res.send(constants.ERR);
  } else {
    let result = checkResult(output);
    if (result == constants.FAILURE) {
      res.send(result);
    } else {
      console.log(result);

      // Checking if store has filled in everything
      if (!Misc.validObject(result, ["mall", "location", "tags", "description", "parentCompany"])) {
        res.send(constants.FAILURE);
      } else if (result.location.length == 0 || results.tags.length == 0 || results.parentCompany == "") {
        // Check if location, tags, and parentCompany are valid
        res.send(constants.FAILURE);
      } else {
        res.send(constants.SUCCESS);
      }
    }
  }
}

let checkResult = (result) => {
  if (result) {
    return result;
  } else {
    return constants.FAILURE;
  }
}

module.exports = {
  callback,
  regCallback,
  putCallback,
  getArrCallback,
  getObjCallback,
  socialCallback,
  emailCallback,
  reqCallback,
  storeCheckCallback
}
