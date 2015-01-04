var common = require('./common');
var http = require('http');

var createRequestOptions = function(callbackUrl, options) {
  options = options || {};
  options.method = common.SUBSCRIBE_METHOD;
  options.path = common.EVENT_PATH;
  options.header = {
    // TODO: Should this be XML escaped?
    'CALLBACK': '<' + callbackUrl + '>',
    'NT': 'upnp:event'
  };
  return options;
};

module.exports.request = function(callbackUrl, options, callback) {
  options = createRequestOptions(callbackUrl, options);
  http.request(options, function(res) {
    var error = common.getError(res);
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
      data.timeout = headers.timeout;
    }
    callback(null, data);
  });
};
