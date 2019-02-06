const mongoose = require('mongoose')
const constants = require('../config/constants')

exports.callBack = function(res, err, result) {
  if (err) {
    console.log(err);
    res.send(constants.ERR);
  } else {
    res.send(result);
  }
};

exports.putCallback = function(res, err, output, type) {
  console.log(output.claims)
  if (err) {
    res.send(constants.ERR);
  }
  else {
      var retVal = {"Updated": "Updated", message: `Congrats! Thanks for claiming your deal. ${output.claims} have claimed this deal so far`};
      res.send(retVal);
  }
};

exports.getArrCallback = function(res, err, output) {
  if (err) {
    res.send(constants.ERR);
  }
  else {
    res.send(output);
  }
};

exports.getObjCallback = function(res, err, output) {
  if (err) {
    res.send(constants.ERR);
  }
  else {
    res.send(output[0]);
  }
};

exports.redirectCallback = function(res, redirect, isFirst, id) {
  if (isFirst) {
    res.redirect(`http://localhost:8080/auth/success#user_id=${id}`)
  } else {
    res.redirect(`http://localhost:8080/auth/success#user_id=${id}`)
  }
};

exports.findIdCallback = function(res, err, result) {
  if (err) {
    console.log(err);
    res.send(constants.NOT_FOUND_ERROR);
  }
}

// This should work both there and elsewhere.
exports.isEmptyObject = function(obj) {
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
};

exports.isValidObjectId = function(idString) {
  var matches = idString.match(/^[0-9a-fA-F]$/);
  return matches == null;
};

exports.dealsQuery = function(obj) {
  var query = obj;
  if ("expiryDate" in query) {
    query.expiryDate = {
      $gte: jsonData.expiryDate
    }
  }
  if ("available" in query) {
    if (query.available) {
      query.usesLeft = {
        $ne: 0
      }
      query.isActive = true;
    } else {
      query.usesLeft = 0
      query.isActive = false;
    }
    delete query.available;

    return query;
  }
}

exports.usersQuery = function(obj) {
  var query =
  {
    email: obj.email,
    first: obj.firstName,
    last: obj.lastName
  }
  return query
};

exports.createUser = function(User, inputObj) {

  //TODO newID seems to be undefined
  const newID = mongoose.Types.ObjectId();

  var newObj = new User(
    {
      _id: newID,
      provider: "Email",
      email: inputObj.email,
      first: inputObj.first,
      middle: "",
      last: inputObj.last,
      age: -1,
      gender: "",
      location: ""
    });

  return newObj;
};
