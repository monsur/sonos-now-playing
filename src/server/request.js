var http = require('http');

var Request = function() {
};

Request.send = function(options, successCallback, errorCallback) {
  var req = http.request(options, successCallback);
  req.on('error', errorCallback);
  req.end();
};

module.exports = Request;
