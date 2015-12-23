var config = require('./config');
var express = require('express');
var http = require('http');
var RecursiveXml2Js = require('./recursive-xml2js');
var SonosEvent = require('./event');
var Logger = require('./logger');

var options = config.getOptions();

if (!('speakerIp' in options)) {
  Logger.error('Speaker IP not specified.');
  process.exit(1);
}
if (!('eventPath' in options)) {
  Logger.error('Event path not specified.');
  process.exit(1);
}

var statusEvent = new SonosEvent({
  speakerIp: options.speakerIp,
  speakerPort: options.speakerPort,
  path: options.eventPath,
  callbackUrl: options.callbackUrl,
  handler: function(err, result) {
    if (err) {
      Logger.error(JSON.stringify(err, 2));
    } else {
      Logger.info('\n' + JSON.stringify(result, null, 2));
    }
  }});
statusEvent.subscribe();

var app = express();

app.notify(options.callbackPath, function(req, res, next) {

  var body = '';
  req.on('data', function(chunk) {
    body += chunk.toString();
  });
  req.on('end', function() {
    // Respond to the request first so we don't keep Sonos waiting.
    res.writeHead(200);
    res.end();

    Logger.info('\n' + JSON.stringify(req.headers, null, 2));
    var parser = new RecursiveXml2Js();
    parser.parse(body, function(err, result) {
      statusEvent.handle(err, result);
    });
  });

});

app.listen(options.port);
