'use strict';

const app = require('./src/app');
const sls = require('serverless-http');

module.exports.run = sls(app);

// let getNearestNeighbours = async (nearestNeighbours) {
//   try {
//     let result = await User.find({ _id: { $in : nearestNeighbours} }).exec({});
//     console.log(result);
//     return result;
//   } catch (e) {
//     console.log(e);
//     return [];
//   }
// }
