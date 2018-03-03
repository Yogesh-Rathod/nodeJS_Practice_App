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
const User = require('../models/User');

// All User Functions Go Here
module.exports = {

  getAllUsers: (req, res) => {
    User.find().
      then((users) => {
        response.success.payload = users;
        res.status(200).send(response.success);
      }).catch((err) => {
        logger.error(`Error: ${err}`);
        response.error.message = err;
        res.status(200).send(response.error);
      });
  }

};
