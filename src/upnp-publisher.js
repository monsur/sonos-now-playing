var http = require('http');

var UpnpPublisher = function(options, logger) {
  this.speakerIp = options.speakerIp;
  this.sid = null;
  this.timeout = UpnpPublisher.DEFAULT_TIMEOUT;
  this.renewalId = null;
  this.logger = logger;
};

UpnpPublisher.DEFAULT_TIMEOUT = 43200000;
UpnpPublisher.TIMEOUT_PREFIX = 'Second-';

UpnpPublisher.prototype.handleError = function(callback, msg, fields) {
  fields = fields || {};
  fields.error = msg;
  this.logger.error(msg);
  callback(fields);
};

UpnpPublisher.prototype.handleHttpError = function(callback, status, headers) {
  var error = null;
  if (status === 400) {
    error = 'Incompatible header fields';
  } else if (status === 412) {
    error = 'Precondition failed';
  } else if (status >= 500) {
    error = 'Unable to accept renewal';
  }
  if (error) {
    this.handleError(callback, error, {
      'statusCode': status,
      'headers': headers
    });
    return true;
  }
  return false;
};

UpnpPublisher.prototype.getRequestOptions = function(method, headers) {
  return {
    method: method,
    hostname: this.speakerIp,
    port: 1400,
    path: '/MediaRenderer/AVTransport/Event',
    headers: headers
  }
};

UpnpPublisher.prototype.subscribe = function(callbackUrl, callback) {
  callbackUrl = callbackUrl || null;
  callback = callback || function() {};

  if (this.sid) {
    return this.handleError(callback, 'Already subscribed with SID "' + this.sid + '".');
  }
  if (!callbackUrl) {
    return this.handleError(callback, 'callbackUrl is required.');
  }

  this.subscribeInternal({
      'CALLBACK': '<' + callbackUrl + '>',
      'NT': 'upnp:event'
    }, callback);
};

UpnpPublisher.prototype.scheduleRenew = function() {
  var that = this;
  this.renewalId = setTimeout(function() {
    that.renew();
  }, this.timeout);
};

UpnpPublisher.prototype.renew = function(callback) {
  callback = callback || function() {};

  if (!this.sid) {
    return this.handleError(callback, 'No subscription.');
  }

  this.subscribeInternal({
      'SID': this.sid,
      'TIMEOUT': UpnpPublisher.TIMEOUT_PREFIX + (this.timeout || UpnpPublisher.DEFAULT_TIMEOUT)
    }, callback);
};

UpnpPublisher.prototype.subscribeInternal = function(headers, callback) {
  var that = this;

  var options = this.getRequestOptions('SUBSCRIBE', headers);
  var req = http.request(options, function(res) {
    var headers = res.headers;
    var status = res.statusCode;
    if (that.handleHttpError(callback, status, headers)) {
      return;
    }

    if ('sid' in headers) {
      that.sid = headers['sid'];
    }
    if ('timeout' in headers) {
      that.timeout = parseInt(headers['timeout'].substr(UpnpPublisher.TIMEOUT_PREFIX.length));
    }

    that.logger.info('Subscribed to speaker %s with SID %s',
        that.speakerIp, that.sid);
    callback({
      'sid': that.sid,
      'timeout': that.timeout
    });

    that.scheduleRenew();
  });

  req.on('error', function(e) {
    that.logger.error(e.message);
  });

  req.end();
};

UpnpPublisher.prototype.unsubscribe = function(callback) {
  var that = this;
  callback = callback || function() {};

  if (this.renewalId) {
    clearTimeout(this.renewalId);
    this.renewalId = null;
  }
  if (!this.sid) {
    return this.handleError(callback, 'No subscription.');
  }

  var options = this.getRequestOptions('UNSUBSCRIBE', {
      'SID': this.sid
    });
  var req = http.request(options, function(res) {
    var headers = res.headers;
    var status = res.statusCode;
    if (that.handleHttpError(callback, status, headers)) {
      return;
    }

    that.logger.info('Unsubscribed from speaker %s with SID %s',
        that.speakerIp, that.sid);
    that.sid = null;
    callback({});
  });

  req.on('error', function(e) {
    this.logger.error(e.message);
  });

  req.end();
};

module.exports = UpnpPublisher;
