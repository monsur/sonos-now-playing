var winston = require('winston');

var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({
        handleExceptions: true,
        timestamp: true
      }),
      new (winston.transports.File)({
        filename: 'sonos-now-playing.log',
        handleExceptions: true,
        level: 'debug',
        maxFiles: 1,
        maxsize: 1000000,
        timestamp: true
      })
    ]
});

var Logger = {
};

Logger.debug = function() {
  logger.debug.apply(this, arguments);
};

Logger.info = function() {
  logger.info.apply(this, arguments);
};

Logger.warn = function() {
  logger.warn.apply(this, arguments);
};

Logger.error = function() {
  logger.error.apply(this, arguments);
};

module.exports = Logger;
