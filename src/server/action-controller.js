var Logger = require('./logger');
var http = require('http');

var PLAY = 'Play',
    PAUSE = 'Pause',
    NEXT = 'Next';

var createBody = function(action) {
  return '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" ' +
    's:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><s:Body>' +
    '<u:' + action + ' xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">' +
    '<InstanceID>0</InstanceID><Speed>1</Speed></u:' + action + '>' +
    '</s:Body></s:Envelope>';
};

var createResponse = function(action) {
  return '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" ' +
    's:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><s:Body>' +
    '<u:' + action + 'Response ' +
    'xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">' +
    '</u:' + action + 'Response></s:Body></s:Envelope>';
};


var ActionController = function(speakerIp, port) {
  this.speakerIp = speakerIp;
  this.port = port;

  var requests = {};
  requests[PLAY] = this.createRequest(PLAY);
  requests[PAUSE] = this.createRequest(PAUSE);
  requests[NEXT] = this.createRequest(NEXT);
  this.requests = requests;
};

ActionController.prototype.createRequest = function(action) {
  this.body = createBody(action);
  this.response = createResponse(action);
  var request = {
    method: 'POST',
    hostname: this.speakerIp,
    port: this.port,
    path: '/MediaRenderer/AVTransport/Control',
    headers: {
      'Content-Type': 'text/xml; charset="utf-8"',
      'Content-Length': this.body.length,
      'SOAPACTION': '"urn:schemas-upnp-org:service:AVTransport:1#' + action + '"'
    }
  };
  return {
    action: action,
    request: request,
    body: this.body,
    response: this.response
  };
};

ActionController.prototype.send = function(data, callback) {
  var that = this;
  callback = callback || function() {};
  Logger.info('Sending ' + data.action + ' to speaker ' +
      data.request.hostname);
  var req = http.request(data.request, function(res) {
    var body = '';

    res.on('data', function(chunk) {
      body += chunk;
    });

    res.on('end', function() {
      if (body != data.response) {
        return callback(body, null);
      }
      callback(null, true);
    });
  });
  req.on('error', function(e) {
    Logger.error(e.message);
  });
  req.write(data.body);
  req.end();
};

ActionController.prototype.play = function(callback) {
  this.send(this.requests[PLAY], callback);
};

ActionController.prototype.pause = function(callback) {
  this.send(this.requests[PAUSE], callback);
};

ActionController.prototype.next = function(callback) {
  this.send(this.requests[NEXT], callback);
};

module.exports = ActionController;

