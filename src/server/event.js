var http = require('http');
var Logger = require('./logger');
var Options = require('./options');

var timeoutPrefix = 'Second-';
var defaultCallback = function() {};

var statusCodeMessages = {
  400: 'Incompatible header fields',
  412: 'Precondition failed',
  500: 'Unable to accept renewal'
};

var defaultOptions = {
  'timeout': 43200,
  'autoRenew': true
};

/**
 * The Event class handles the details of a single subscription event.
 * @param {Object} opts - Various options for this instance.
 * @constructor
 */
var Event = function(opts) {
  this.opts = new Options(opts, defaultOptions);
  this.sid = null;
  this.timeout = this.opts.timeout;
  this.timeoutId = null;
};

Event.request = function(options, successCallback, errorCallback) {
  var req = http.request(options, successCallback);
  req.on('error', errorCallback);
  req.end();
};

Event.parseHttpError = function(res) {
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

Event.setTimeout = function(func, millis) {
  setTimeout(func, millis);
};

Event.clearTimeout = function(id) {
  clearTimeout(id);
};

Event.prototype.getHandler = function() {
  return this.opts.handler;
};

Event.prototype.getSid = function() {
  return this.sid;
};

Event.prototype.getPath = function() {
  return this.opts.path;
};

/**
 * Parses a timeout value from the uPnP Timeout header. If the header cannot
 * be parsed, or the value is less than one, returns the default timeout value
 * of 43200 seconds (12 hours).
 * @param {string} val - The Timeout header value, in the form "Second-NNNN",
 *     where NNNN is the timeout time in seconds.
 * @returns The timeout value in seconds.
 */
Event.prototype.parseTimeout = function(val) {
  var timeout = parseInt(val.substr(timeoutPrefix.length));
  if (isNaN(timeout) || timeout < 1) {
    return this.opts.timeout;
  }
  return timeout;
};

/**
 * Subscribe to a Sonos event.
 * @param {Object} opts - Various options for this instance.
 * @param {Function} handler - The function which fires when an event is
 *     received.
 * @param {Function} callback - The function which fires after the
 *     subscription is complete.
 */
Event.prototype.subscribe = function(opts, callback) {
  if (arguments.length === 0) {
    callback = defaultCallback;
  } else if (arguments.length === 1) {
    if (typeof opts === 'function') {
      callback = opts;
    } else {
      this.opts.set(opts);
      callback = defaultCallback;
    }
  } else if (arguments.length === 2) {
    this.opts.set(opts);
  } else {
    throw new Error('Incorrect number of arguments. Expected 2.');
  }

  // A subscription requires a callback url.
  if (!this.opts.callbackUrl) {
    throw new Error('Must specify a callback URL.');
  }

  Logger.info('Subscribing to speaker ' + this.opts.speakerIp + ' with ' +
      'callback URL ' + this.opts.callbackUrl);

  this.subscribeInternal({
    'CALLBACK': '<' + this.opts.callbackUrl + '>',
    'NT': 'upnp:event'
  }, callback);
};

/**
 * Renews a subscription.
 * @param {Function} callback - The function to call after the renewal is complete.
 */
Event.prototype.renew = function(callback) {
  callback = callback || defaultCallback;

  // A SID is required to renew a subscription.
  if (!this.sid) {
    throw new Error('Must specify a SID.');
  }

  Logger.info('Renewing speaker ' + this.opts.speakerIp + ' with SID ' +
      this.sid + ' and timeout ' + this.timeout);

  this.subscribeInternal({
    'SID': this.sid,
    'TIMEOUT': timeoutPrefix + this.timeout
  }, callback);
};

/**
 * Common function to either initiate a new subscription, or renew an existing
 * subscription. A subscription is an HTTP request with a SUBSCRIBE HTTP
 * method.
 * @param {Object} headers - HTTP headers to include in the request.
 * @param {Function} callback - The function that fires after the subscription
 *     completes.
 */
Event.prototype.subscribeInternal = function(headers, callback) {
  var options = {};
  options.method = 'SUBSCRIBE';
  options.headers = headers;

  var that = this;
  this.request(options, function(error, res) {
    if (error) {
      return callback(error, null);
    }

    // If the subscription is successful, store both the SID and timeout.
    var headers = res.headers;
    var data = {};
    if ('sid' in headers) {
      data.sid = that.sid = headers.sid;
    }
    if ('timeout' in headers) {
      // Parse the timeout value to ensure it is a number.
      var timeout = that.parseTimeout(headers.timeout);
      data.timeout = that.timeout = timeout;
      if (that.opts.autoRenew) {
        // Set a timeout to renew the subscription.
        var timeoutMs = that.timeout * 1000;
        Logger.info('Setting to renew in ' + timeoutMs + 'ms');
        that.timeoutId = Event.setTimeout(function() {
          that.renew();
        }, timeoutMs);
      }
    }
    callback(null, data);
  });
};

Event.prototype.unsubscribe = function(callback) {
  callback = callback || defaultCallback;

  if (!this.sid) {
    throw new Error('Must specify a SID.');
  }

  Logger.info('Unsubscribing speaker ' + this.opts.speakerIp + ' with SID ' +
      this.sid);

  var that = this;
  this.request({
    method: 'UNSUBSCRIBE',
    headers: {
      'SID': this.sid
    }
  }, function(err, data) {
    if (err) {
      return callback(err, null);
    }
    if (that.timeoutId) {
      Event.clearTimeout(that.timeoutId);
    }
    that.timeoutId = null;
    that.timeout = null;
    that.sid = null;
    callback(null, data);
  });
};

Event.prototype.request = function(options, callback) {
  options = options || {};
  options.hostname = this.opts.speakerIp;
  options.port = this.opts.port;
  options.path = this.opts.path;

  var successCallback = function(res) {
    var error = Event.parseHttpError(res);
    if (error) {
      return callback(error, null);
    }
    return callback(null, res);
  };

  var errorCallback = function(e) {
    callback(e, null);
  };

  Event.request(options, successCallback, errorCallback);
};

module.exports = Event;
