// ========== Global Dependencies ============ //
const express = require('express')
const app = express();
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const bodyParser = require('body-parser');
const validator = require('express-validator');
const _ = require('lodash');
const async = require('async');

// ========== Setting Up Middlewares ============= //
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(validator());

// ========== Local Imports ============ //
const response = require('../responses');

// All Home Page Functions Go Here
module.exports = {
  
  homeMessage: (req, res) => {
    res.status(200).send(response.success);
  }

};
