var Logger = require('little-logger').Logger;
var SubscriptionController = require('./subscription-controller');
var ActionController = require('./action-controller');

var port = 1400;

var getCallbackUrl = function(ip, port, callbackPath) {
  return 'http://' + ip + ':' + port + callbackPath;
};

var SonosController = function(options, logger, controller, action) {
  this.callbackUrl = getCallbackUrl(options.ip, options.port,
      options.callbackPath);
  this.logger = logger || new Logger(null, {enabled: false});
  this.controller = controller ||
      new SubscriptionController(options.speakerIp, port, logger);
  this.action = action ||
      new ActionController(options.speakerIp, port, logger);
  this.sid = null;
  this.timeout = null;
  this.renewalId = null;
  // TODO: Add an error handler to catch renew errors.
};

SonosController.prototype.subscribe = function(callback) {
  var that = this;
  this.controller.subscribe(this.callbackUrl, function(error, data) {
    if (error) {
      return callback(error, null);
    }
    that.scheduleRenew(data);
  });
};

SonosController.prototype.scheduleRenew = function(data) {
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

SonosController.prototype.renew = function() {
  var that = this;
  this.controller.renew(this.sid, this.timeout, function(error, data) {
    if (error) {
      return that.logger.error(error.message);
    }
    that.scheduleRenew(data);
  });
};

SonosController.prototype.unsubscribe = function(callback) {
  if (this.renewalId) {
    clearTimeout(this.renewalId);
    this.renewalId = null;
  }
  if (this.sid) {
    this.controller.unsubscribe(this.sid, callback);
  }
};

SonosController.prototype.togglePlay = function(callback) {
  // TODO
};

SonosController.prototype.next = function(callback) {
  // TODO
};

module.exports = SonosController;
