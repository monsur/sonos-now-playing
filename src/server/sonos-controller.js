var Logger = require('little-logger').Logger;

var port = 1400;
var timeoutPrefix = 'Second-';

var getError = function(res) {
  var statusCode = res.statusCode;
  if (statusCode === 200) {
    return null;
  }

  var msg = null;
  if (statusCode === 400) {
    msg = 'Incompatible header fields';
  } else if (statusCode === 412) {
    msg = 'Precondition failed';
  } else if (statusCode >= 500) {
    msg = 'Unable to accept renewal';
  }

  var error = {
    'statusCode': statusCode,
    'headers': res.headers
  };
  if (msg) {
    error.msg = msg;
  }
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
  this.logger.info('Subscribing to speaker ' + this.speakerIp + ' with ' +
      'callback URL ' + callbackUrl);
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
      var timeout = parseTimeout(headers.timeout);
      if (!isNaN(timeout)) {
        data.timeout = timeout;
      }
    }
    callback(null, data);
  });
};

SonosController.prototype.renew = function(sid, timeout, callback) {
  if (!sid) {
    throw new Error('Must specify a SID.');
  }
  if (arguments.length === 2) {
    callback = timeout;
    timeout = null;
  } else if (typeof timeout !== 'number') {
    throw new Error('Timeout must be a number.');
  }
  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function');
  }
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
      callback(error, null);
      return;
    }
    callback(null, res);
  });
};

module.exports = SonosController;

