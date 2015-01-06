var Logger = require('little-logger').Logger;

var port = 1400;
var timeoutPrefix = 'Second-';
var defaultTimeout = 43200000;

var statusCodeMessages = {
  400: 'Incompatible header fields',
  412: 'Precondition failed',
  500: 'Unable to accept renewal'
};

var getErrorMessage = function(statusCode) {
  return msg;
};

var getError = function(res) {
  var statusCode = res.statusCode;
  if (statusCode === 200) {
    return null;
  }

  var msg = null;
  if (statusCode in statusCodeMessages) {
    msg = statusCodeMessages[statusCode];
  } else if (statusCode >= 500) {
    msg = statusCodeMessages[500];
  } else {
    msg = 'HTTP status code ' + statusCode;
  }

  var error = new Error(msg);
  error.details = {
    'statusCode': statusCode,
    'headers': res.headers
  };

  return error;
};

var parseTimeout = function(val) {
  return parseInt(val.substr(timeoutPrefix.length));
};

var SonosController = function(speakerIp, logger, request) {
  this.speakerIp = speakerIp;
  this.logger = logger || new Logger(null, {enabled: false});
  this.request = request || require('http').request;
};

SonosController.prototype.subscribe = function(callbackUrl, callback) {
  if (!callbackUrl) {
    return callback(new Error('Must specify a callback URL.'), null);
  }

  this.logger.info('Subscribing to speaker ' + this.speakerIp + ' with ' +
      'callback URL ' + callbackUrl);

  this.subscribeInternal({
    'CALLBACK': '<' + callbackUrl + '>',
    'NT': 'upnp:event'
  }, callback);
};

SonosController.prototype.renew = function(sid, timeout, callback) {
  if (!sid) {
    return callback(new Error('Must specify a SID.'), null);
  }
  if (arguments.length === 2) {
    callback = timeout;
    timeout = null;
  } else if (typeof timeout !== 'number') {
    return callback(new Error('Timeout must be a number.'), null);
  }
  if (typeof callback !== 'function') {
    return callback(new Error('Callback must be a function'), null);
  }
  timeout = timeout || defaultTimeout;

  this.logger.info('Renewing speaker ' + this.speakerIp + ' with ' +
      'SID ' + sid + ' and timeout ' + timeout);

  this.subscribeInternal({
    'SID': sid,
    'TIMEOUT': timeoutPrefix + defaultTimeout
  }, callback);
};

SonosController.prototype.subscribeInternal = function(headers, callback) {
  var options = {};
  options.method = 'SUBSCRIBE';
  options.path = '/MediaRenderer/AVTransport/Event';
  options.headers = headers;

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
      var timeout = parseTimeout(headers.timeout);
      if (!isNaN(timeout)) {
        data.timeout = timeout;
      }
    }
    callback(null, data);
  });
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
  this.request(options, function(res) {
    var error = getError(res);
    if (error) {
      return callback(error, null);
    }
    callback(null, res);
  });
};

module.exports = SonosController;

