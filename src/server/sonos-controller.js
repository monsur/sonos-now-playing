var http = require('http');

var port = 1400;

var parseTimeout = function(val) {
  var prefix = 'Second-';
  return parseInt(val.substr(prefix.length));
};

var SonosController = function(speakerIp, logger) {
  this.speakerIp = speakerIp;
  this.logger = logger;
};

SonosController.prototype.subscribe = function(callbackUrl, callback) {
  if (!callbackUrl) {
    throw new Error('Must specify a callback URL.');
  }
  var options = {};
  options.method = 'SUBSCRIBE';
  options.path = '/MediaRenderer/AVTransport/Event';
  options.headers = {
    'CALLBACK': '<' + callbackUrl + '>',
    'NT': 'upnp:event'
  };
  this.makeRequest(options, function(error, res) {
    if (error) {
      callback(error, null);
      return;
    }

    var headers = res.headers;
    var data = {};
    if ('sid' in headers) {
      data.sid = headers.sid;
    }
    if ('timeout' in headers) {
      data.timeout = parseTimeout(headers.timeout);
    }
    callback(null, data);
  });
};

SonosController.prototype.renew = function(callback) {
};

SonosController.prototype.unsubscribe = function(callback) {
};

SonosController.prototype.play = function(callback) {
};

SonosController.prototype.pause = function(callback) {
};

SonosController.prototype.next = function(callback) {
};

SonosController.prototype.makeRequest = function(options, callback) {
  options.hostname = this.speakerIp;
  options.port = port;
};

module.exports = SonosController;

