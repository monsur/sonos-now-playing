var UpnpPublisher = require('./upnp-publisher');

var getNotificationUrl = function(options) {
  return 'http://' + options.ip + ':' + options.port + options.notificationPath;
};

var SubscriptionHandler = function(options, logger) {
  this.notificationUrl = getNotificationUrl(options);
  this.publisher = new UpnpPublisher(options, logger);
};

SubscriptionHandler.prototype.subscribe = function(callback) {
  this.publisher.subscribe(this.notificationUrl, callback);
};

SubscriptionHandler.prototype.unsubscribe = function(callback) {
  this.publisher.unsubscribe(callback);
};

module.exports = SubscriptionHandler;
