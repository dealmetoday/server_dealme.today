'use strict';

const app = require('./src/app');
const sls = require('serverless-http');

module.exports.run = sls(app);
