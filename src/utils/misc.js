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

  if("tags" in query){
    query.tags = {
      $in: query.tags
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

let storeQuery = (obj) => {
  let query = obj
  if("_id" in query){
    query._id = {
      $in: query._id
    }
  }
  return query
}

let usersQuery = (obj) => {
  let query = {};

  if (noProperty(obj, "email") || noProperty(obj, "firstName") || noProperty(obj, "lastName")) {
    return null;
  } else {
    query.email = obj.email;
    query.first = obj.firstName;
    query.last = obj.lastName;

    return query;
  }
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

let storeExists = async (Store, email) => {
  let retVal = {};
  let result = await Store.findOne({ email: email }).exec();
  if (isEmptyObject(result)) {
    retVal.status = false;
  } else {
    retVal.status = true;
    retVal.id = result._id;
  }

  return retVal;
};

let createRequest = (Request, inputObj, model) => {
  const newID = mongoose.Types.ObjectId();

  let newObj = new Request(
    {
      _id: newID,
      content: inputObj,
      model: model,
    });

  return newObj;
}

let validEmail = (email) => {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
  {
    return true;
  }
    return false;
}

let validObject = (object, properties) => {
  if (isEmptyObject(object)) {
    return false;
  }

  for (let index in properties) {
    let property = properties[index];
    if (noProperty(object, property)) {
      return false;
    }
  }

  return true;
}

let createDate = (UTCSeconds) => {
  let curr = new Date(0);
  curr.setUTCSeconds(UTCSeconds);

  return curr;
}

let shiftArr = (arr, toInsert) => {
  arr.unshift(toInsert);
  arr.pop();

  return arr;
}

let noProperty = (object, property) => {
  return !object.hasOwnProperty(property);
}

module.exports = {
  isEmptyObject,
  isValidObjectId,
  dealsQuery,
  usersQuery,
  storeQuery,
  userExists,
  storeExists,
  createRequest,
  validEmail,
  validObject,
  createDate,
  shiftArr
}
