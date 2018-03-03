// ========== Global Dependencies ============ //
const dotenv = require('dotenv');
const express = require('express');
const app = express(); 
const fs = require('fs');
const path = require('path');
const compression = require('compression');
const errorHandler = require('errorhandler');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const passport = require('passport');
const session = require('express-session');
const schedule = require('node-schedule');

/* Local Imports */
const routes = require('./src/controllers');
const logger = require("./logger");

// ========== Config Options For Middlewares ============= //

const corsOptions = {
    origin: '*',
    credentials: true,
    optionsSuccessStatus: 200
};

// ========== Setting Up Middlewares ============= //
if (process.env.environment === 'dev') {
    dotenv.load({ path: '.env.dev' });
} else {
    dotenv.load({ path: '.env.prod' });
}
// required for passport session
app.use(session({
    secret: 'secrettexthere',
    saveUninitialized: true,
    resave: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors(corsOptions));
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(helmet());
// Winston Logger
app.use(morgan('combined', { "stream": logger.stream }));
logger.debug("Winston Logger Initialzed!");

// ========== Connect To MongoDB through Mongoose ============= //

mongoose.connect(process.env.DB_URL, { useMongoClient: true });

// MONGOOSE CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {
    console.log('Mongoose connection open at', process.env.DB_URL);
    logger.info(`Mongoose connection open at ${process.env.DB_URL}`);
});

// If the connection throws an error
mongoose.connection.on('error', function (err) {
    console.log('Mongoose connection error: ' + err);
    logger.error(`Mongoose connection error: ${err}`);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose connection disconnected');
    logger.warn('Mongoose connection disconnected');
});

// ========== API Routing ============= //  
app.use('/api', routes);

/**
* Error Handler.
*/
app.use(errorHandler());


// Clear uploads folder everyday at 5:00 AM

var clearUploads = schedule.scheduleJob('00 30 5 * * 0-7 ', () => {
    const directory = 'uploads';
    fs.readdir(directory, (err, files) => {
        if (err) {
            logger.error(`err ${err}`)
            throw err
        }
        for (const file of files) {
            fs.unlink(path.join(directory, file), err => {
                if (err) {
                    logger.error(`err ${err}`)
                    throw err
                }
                logger.info('Cleared Upload Directory', new Date());
            });
        }
    });
});

// ========== Listen to Requests ============= //
app.listen(process.env.PORT, () => {
    console.log("App is running at PORT ", process.env.PORT);
    logger.info(`App is running at PORT ${process.env.PORT}`);
});