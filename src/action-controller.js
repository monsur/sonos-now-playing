var Logger = require('little-logger').Logger;
var http = require('http');

var Action = function(speakerIp, port, action, body, response, logger) {
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

Action.prototype.createBody = function(body) {
  return '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" ' +
    's:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><s:Body>' +
    body + '</s:Body></s:Envelope>';
};

Action.prototype.send = function(callback) {
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


var PlayAction = function(speakerIp, port, logger) {
  this.action = new Action(speakerIp, port,
      'action',
      'body',
      'response',
      logger);
};
PlayAction.prototype.send = function(callback) {
  this.action.send(callback);
};


var PauseAction = function(speakerIp, port, logger) {
  this.action = new Action(speakerIp, port,
      'action',
      'body',
      'response',
      logger);
};
PauseAction.prototype.send = function(callback) {
  this.action.send(callback);
};


var NextAction = function(speakerIp, port, logger) {
  this.action = new Action(speakerIp, port,
      'action',
      'body',
      'response',
      logger);
};
NextAction.prototype.send = function(callback) {
  this.action.send(callback);
};

module.exports = {
  'PlayAction': PlayAction,
  'PauseAction': PauseAction,
  'NextAction': NextAction
};
