const helmet = require('helmet');
const express = require('express');
const bodyParser = require('body-parser');

const routes = require('./routes');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());

require('./db');
app.use(routes);

app.get('/', function(req, res) {
  var body = "You have hit the root of the server - which currently doesn't do anything.";
  res.set('Content-Type', 'text/plain');
  res.set('charset', 'utf-8');
  res.charset =
  res.writeHead(200);
  res.end(body);
});

module.exports = app;
