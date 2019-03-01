const mongoose = require('mongoose')

// This should work both there and elsewhere.
let isEmptyObject = (obj) => {
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
};

let isValidObjectId = (idString) => {
  var matches = idString.match(/^[0-9a-fA-F]$/);
  return matches == null;
};

let dealsQuery = (obj) => {
  var query = obj;
  if ("expiryDate" in query) {
    query.expiryDate = {
      $gte: query.expiryDate
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

let usersQuery = (obj) => {
  var query =
  {
    email: obj.email,
    first: obj.firstName,
    last: obj.lastName
  }
  return query
};

let userExists = async (User, email) => {
  let retVal = {};
  let result = await User.findOne({ email: email }).exec();
  if (isEmptyObject(result)) {
    retVal.status = false;
  } else {
    retVal.status = true;
    retVal.id = result._id;
  }

  return retVal;
};

let createRequest = (Request, inputObj) => {
  const newID = mongoose.Types.ObjectId();

  let newObj = new Request(
    {
      _id: newID,
      content: inputObj
    });

  return newObj;
}

module.exports = {
  isEmptyObject,
  isValidObjectId,
  dealsQuery,
  usersQuery,
  userExists,
  createRequest
}
