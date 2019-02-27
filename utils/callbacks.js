const JWT = require('../utils/jwt');
const Security = require('../utils/security');
const constants = require('../config/constants');

let callback = (res, err, output) => {
  if (err) {
    console.log(err);
    res.send(constants.ERR);
  } else {
    let result = checkResult(output);
    res.send(result);
  }
};

let regCallback = (res, err, output) => {
  if (err) {
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

let loginCallback = (res, err, output, email) => {
  if (err) {
    return;
  } else {
    let payload = {};
    payload.id = output._id;
    payload.email = email;

    let retVal = constants.SUCCESS;
    retVal[constants.BEARER] = JWT.sign(payload);
    res.send(retVal);
  }
};

let emailCallback = (res, err, output, password, email) => {
  if (err) {
    return;
  } else {
    let hashed = output.password;
    let verifyResult = Security.otherVerify(password, hashed);

    if (verifyResult) {
      let payload = {};
      payload.id = output._id;
      payload.email = email;

      let retVal = constants.SUCCESS;
      retVal[constants.BEARER] = JWT.sign(payload);

      res.send(retVal);
    } else {
      res.send(constants.FAILURE);
    }
  }
};

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
  loginCallback,
  emailCallback
}
