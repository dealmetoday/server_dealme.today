const cors = require('cors');
const helmet = require('helmet');
const express = require('express');
const bodyParser = require('body-parser');
const mongooseMulti = require('mongoose-multi')

const dbConfig = require('./config/config');
const schemaFile = require('./config/schemas');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors());

// Main connections
var databases = mongooseMulti.start(dbConfig.db, schemaFile);
require('./routes/tagRoutes')(app, databases.tagsDB, databases.requestDB);
require('./routes/authRoutes')(app, databases.authDB, databases.usersDB, databases.mallsDB);
require('./routes/userRoutes')(app, databases.usersDB, databases.authDB, databases.dealsDB, databases.requestDB);
require('./routes/mallRoutes')(app, databases.mallsDB, databases.requestDB, databases.authDB);
require('./routes/dealRoutes')(app, databases.dealsDB, databases.usersDB);
require('./routes/requestRoutes')(app, databases.requestDB);

// Misc connections
require('./routes/keyRoutes')(app);
require('./routes/miscRoutes')(app, databases);

app.get('/', (req, res) => {
  let body = "";
  body += "You have hit the root of the server.\n";
  body += "Please format your request to hit a certain endpoint.";

  res.set('Content-Type', 'text/plain');
  res.set('charset', 'utf-8');
  res.writeHead(200);
  res.end(body);
});

module.exports = app;
