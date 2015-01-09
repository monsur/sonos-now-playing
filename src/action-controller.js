var Logger = require('little-logger').Logger;
var http = require('http');

var ActionController = function(speakerIp, port, action, body, response, logger) {
  this.request = {
    method: 'POST',
    hostname: speakerIp,
    port: port,
    path: '/MediaRenderer/AVTransport/Control',
    headers: {
      'Content-Type': 'text/xml',
      'SOAPACTION': action
    }
  };
  this.body = this.createBody(body);
  this.response = response;
};

ActionController.prototype.createBody = function(body) {
  return '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" ' +
    's:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><s:Body>' +
    body + '</s:Body></s:Envelope>';
};

ActionController.prototype.send = function(callback) {
  var that = this;
  var req = http.request(request, function(res) {
    var error = getError(res);
    if (error) {
      return callback(error, null);
    }
    callback(null, true);
  });
  req.on('error', function(e) {
    that.logger.error(e.message);
  });
  req.write(this.body);
  req.end();
};

module.exports = ActionController;
