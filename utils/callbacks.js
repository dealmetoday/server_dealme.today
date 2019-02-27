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

let loginCallback = (res, err, output) => {
  if (err) {
    return;
  } else {
    res.send(constants.SUCCESS);
  }
};

let emailCallback = (res, err, output, password) => {
  if (err) {
    return;
  } else {
    let hashed = output.password;
    let verifyResult = Security.otherVerify(password, hashed);

    if (verifyResult) {
      res.send(constants.SUCCESS);
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
