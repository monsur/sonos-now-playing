var http = require('http');

var Request = {};

Request.send = function() {
  http.request.apply(this, arguments);
};

module.exports = Request;
