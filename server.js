const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
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

const  PORT = process.env.PORT || 5000


const app = express();
app.use(passport.initialize());
app.use(passport.session());

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// connect to DB
const options = { useNewUrlParser: true };
mongoose.connect(`mongodb://localhost/mern_app`, options)
  .then(() => console.log('connected to DB...'))
  .catch(err => console.log('Could not connect', err));


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
require('./routes/checkinRoutes')(app, databases.checkInDB);
require('./routes/dealRoutes')(app, databases.dealsDB, databases.usersDB);

// Initialize all the databases
init(databases);

app.use('/api/dashboard', require("./routes/api/home/home"));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join('./dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve('./dist/index.html'));
  });
}

app.listen(PORT, () => console.log(`App is running on port ${PORT}`));
