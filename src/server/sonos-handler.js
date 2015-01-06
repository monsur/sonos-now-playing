var Logger = require('little-logger').Logger;
var SonosController = require('./sonos-controller');

var getCallbackUrl = function(ip, port, callbackPath) {
  return 'http://' + ip + ':' + port + callbackPath;
};

var SonosHandler = function(options, logger, controller) {
  this.callbackUrl = getCallbackUrl(options.ip, options.port,
      options.callbackPath);
  this.logger = logger || new Logger(null, {enabled: false});
  this.controller = controller ||
      new SonosController(options.speakerIp, logger);
  this.sid = null;
  this.timeout = null;
  this.renewalId = null;
  // TODO: Add an error handler.
};

SonosHandler.prototype.subscribe = function(callback) {
  var that = this;
  this.controller.subscribe(this.callbackUrl, function(error, data) {
    if (error) {
      return callback(error, null);
    }
    that.scheduleRenew(data);
  });
};

SonosHandler.prototype.scheduleRenew = function(data) {
  var that = this;
  if ('sid' in data) {
    this.sid = data.sid;
  }
  if ('timeout' in data) {
    this.timeout = data.timeout;
  }
  this.renewalId = setTimeout(function() {
    that.renew();
  }, this.timeout);
};

SonosHandler.prototype.renew = function() {
  var that = this;
  this.controller.renew(this.sid, this.timeout, function(error, data) {
    if (error) {
      return that.logger.error(error.message);
    }
    that.scheduleRenew(data);
  });
};

SonosHandler.prototype.unsubscribe = function(callback) {
  this.controller.unsubscribe(callback);
};

module.exports = SonosHandler;
