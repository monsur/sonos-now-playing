var ActionController = require('./action-controller');

var port = 1400;

var getCallbackUrl = function(ip, port, callbackPath) {
  return 'http://' + ip + ':' + port + callbackPath;
};

var SonosController = function(options, logger, controller, action) {
  var callbackUrl = getCallbackUrl(options.ip, options.port,
      options.callbackPath);
  this.evt = new SonosEvent({
    speakerIp: options.speakerIp,
    port: port,
    path: '/MediaRenderer/AVTransport/Event',
    callbackUrl: callbackUrl
  });
  this.action = action ||
      new ActionController(options.speakerIp, port, logger);
  // TODO: Add an error handler to catch renew errors.
};

SonosController.prototype.subscribe = function(callback) {
  this.evt.subscribe(callback);
};

SonosController.prototype.unsubscribe = function(callback) {
  this.evt.unsubscribe(callback);
};

SonosController.prototype.togglePlay = function(state, callback) {
  if (state) {
    this.action.play(callback);
  } else {
    this.action.pause(callback);
  }
};

SonosController.prototype.next = function(callback) {
  this.action.next(callback);
};

module.exports = SonosController;
