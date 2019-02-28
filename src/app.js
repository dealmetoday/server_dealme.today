const helmet = require('helmet');
const express = require('express');
const bodyParser = require('body-parser');
const mongooseMulti = require('mongoose-multi')

const init = require('./config/init');
const dbConfig = require('./config/config');
const schemaFile = require('./config/schemas');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());

// Main connections
var databases = mongooseMulti.start(dbConfig.db, schemaFile);
require('./routes/tagRoutes')(app, databases.tagsDB);
require('./routes/authRoutes')(app, databases.authDB, databases.usersDB);
require('./routes/userRoutes')(app, databases.usersDB, databases.dealsDB);
require('./routes/mallRoutes')(app, databases.mallsDB);
require('./routes/dealRoutes')(app, databases.dealsDB, databases.usersDB);

// Misc connections
require('./routes/keyRoutes')(app);
require('./routes/testRoutes')(app);

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
