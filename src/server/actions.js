var Logger = require('./logger');
var Request = require('./request');

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


var Actions = function(opts) {
  var requests = {};
  requests[PLAY] = this.createRequest(opts, PLAY);
  requests[PAUSE] = this.createRequest(opts, PAUSE);
  requests[NEXT] = this.createRequest(opts, NEXT);
  this.requests = requests;
};

Actions.prototype.createRequest = function(opts, action) {
  var body = createBody(action);
  var response = createResponse(action);
  var request = {
    method: 'POST',
    hostname: opts.speakerIp,
    port: opts.speakerPort,
    path: '/MediaRenderer/AVTransport/Control',
    headers: {
      'Content-Type': 'text/xml; charset="utf-8"',
      'Content-Length': body.length,
      'SOAPACTION': '"urn:schemas-upnp-org:service:AVTransport:1#' + action + '"'
    }
  };
  return {
    action: action,
    request: request,
    body: body,
    response: response
  };
};

Actions.prototype.send = function(data, callback) {
  var that = this;
  callback = callback || function() {};

  var successCallback = function(res) {
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
  };

  var errorCallback = function(e) {
    Logger.error(e.message);
  };

  Logger.info('Sending ' + data.action + ' to speaker ' +
      data.request.hostname);

  Request.send(data.request, data.body, successCallback, errorCallback);
};

Actions.prototype.play = function(callback) {
  this.send(this.requests[PLAY], callback);
};

Actions.prototype.pause = function(callback) {
  this.send(this.requests[PAUSE], callback);
};

Actions.prototype.next = function(callback) {
  this.send(this.requests[NEXT], callback);
};

module.exports = Actions;

