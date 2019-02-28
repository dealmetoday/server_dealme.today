const express = require('express');
const notes = require('./notes/notes.controller');

const router = express.Router();

router.use('/notes', notes);

// Add more routes here if you want!
module.exports = router;
