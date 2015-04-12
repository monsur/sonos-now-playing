var http = require('http');

var Request = function() {
};

Request.send = function(options, body, successCallback, errorCallback) {
  var req = http.request(options, successCallback);
  req.on('error', errorCallback);
  if (body) {
    req.write(body);
  }
  req.end();
};

module.exports = Request;
