const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const mongooseMulti = require('mongoose-multi')
const schemaFile = require('./config/schemas')
const init = require('./config/init')
const path = require('path')


let dbConfig;

if(process.env.NODE_ENV === 'production'){
  dbConfig = require('./config/prod-config')
}
else{
  dbConfig = require('./config/dev-config')
}

const PORT = process.env.PORT || 5000

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

// DB connections
var databases = mongooseMulti.start(dbConfig.db, schemaFile);
require('./routes/tagRoutes')(app, databases.tagsDB);
require('./routes/authRoutes')(app, databases.authDB, databases.usersDB);
require('./routes/userRoutes')(app, databases.usersDB, databases.dealsDB);
require('./routes/mallRoutes')(app, databases.mallsDB);
require('./routes/dealRoutes')(app, databases.dealsDB, databases.usersDB);

// Misc connections
require('./routes/keyRoutes')(app);
require('./routes/testRoutes')(app);

// Initialize all the databases
init(databases);

app.get('/', function(req, res) {
  var body = "You have hit the root of the server - which currently doesn't do anything.";
  res.setHeader('Content-Type', 'text/plain');
  res.writeHead(200);
  res.end(body);
});

app.listen(PORT, () => console.log(`App is running on port ${PORT}`));
