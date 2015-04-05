var Events = require('./sonos/events');
var express = require('express');
var RecursiveXml2Js = require('./recursive-xml2js');

var getIpAddress = function() {
  var os = require('os');
  var interfaces = os.networkInterfaces();
  for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
      var address = interfaces[k][k2];
      if (address.family == 'IPv4' && !address.internal) {
        return address.address;
      }
    }
  }
  return null;
};

var opts = {
  'speakerIp': '10.0.1.3',
  'port': 1400,
  'callbackUrl': 'http://' + getIpAddress() + ':5244/notify'
};

var opts2 = {
  'port': 5244
};

var app = express();
var events = new Events(opts);
events.subscribe({
  'path': '/MediaRenderer/AVTransport/Event',
  'handler': function() {
    console.log('handling event');
    console.log(arguments);
  }
});

app.notify('/notify', function(req, res) {
  var body = '';
  req.on('data', function(chunk) {
    body += chunk.toString();
  });
  req.on('end', function() {
    var parser = new RecursiveXml2Js();
    parser.parse(body, function(err, result) {
      if (err) {
        throw new Error(err);
      }
      var opts = {};
      opts.sid = req.headers.sid;
      opts.body = result;
      //events.handle(opts);
      console.log(JSON.stringify(result, null, 2));
      res.writeHead(200);
      res.end();
    });
  });
});

var server = app.listen(opts2.port);

