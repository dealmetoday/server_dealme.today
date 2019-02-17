const constants = require('../config/constants')

let regCallback = (res, err, output) => {
  if (err) {
    console.log(err);
    res.send(constants.ERR);
  } else {
    let result = checkResult(output);
    res.send(result);
  }
};

let putCallback = (res, err, output) => {
  if (err) {
    res.send(constants.ERR);
  }
  else {
      // var retVal = {"Updated": "Updated", message: `Congrats! Thanks for claiming your deal. ${output.claims} have claimed this deal so far`};
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

let redirectCallback = (res, redirect, isFirst, id) => {
  if (isFirst) {
    res.redirect(`appdealme://LaunchScreen`)
    // res.redirect(`http://localhost:8080/auth/success#user_id=${id}`)
  } else {
    res.redirect(`appdealme://LaunchScreen`)
    // res.redirect(`http://localhost:8080/auth/success#user_id=${id}`)
  }
};

let checkResult = (result) => {
  if (result) {
    return result;
  } else {
    return {'Message': 'Result was null. Check your input.'};
  }
}

module.exports = {
  regCallback,
  putCallback,
  getArrCallback,
  getObjCallback,
  redirectCallback
}
