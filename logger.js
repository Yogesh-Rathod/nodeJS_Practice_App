var winston = require('winston'),
  fs = require('fs'),
  logDir = 'logs',
  env = process.env.NODE_ENV || 'development',
  logger;
require('winston-daily-rotate-file');

if (!fs.existsSync(logDir)) {
  // Create the directory if it does not exist
  fs.mkdirSync(logDir);
}
logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: 'warn',
      colorize: true
    }),
    new (winston.transports.DailyRotateFile)({
      level: env === 'development' ? 'debug' : 'info',
      filename: logDir + '/all-logs',
      maxsize: 1024 * 1024 * 10
    })
  ],
  exceptionHandlers: [
    new (winston.transports.DailyRotateFile)({
      filename: `${logDir}/exceptions-logs`
    })
  ]
});

logger.stream = {
  write: (message, encoding) => {
    logger.info(message);
  }
};

module.exports = logger;

