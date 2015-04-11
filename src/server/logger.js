var winston = require('winston');

var Logger = {
};

Logger.debug = function() {
  winston.debug.apply(this, arguments);
};

Logger.info = function() {
  winston.info.apply(this, arguments);
};

Logger.warn = function() {
  winston.warn.apply(this, arguments);
};

Logger.error = function() {
  winston.error.apply(this, arguments);
};

module.exports = Logger;
