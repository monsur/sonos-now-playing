var Events = require('./sonos/events');
var express = require('express');
var xml2js = require('xml2js');

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

app.notify('/notify', function(req, res, next) {
  console.log("RECEIVED NOTIFICATION");
  var body = '';
  req.on('data', function(chunk) {
    body += chunk.toString();
  });
  req.on('end', function() {
    var parser = new Parser({explicitArray: false});
    parser.parse(body, function(err, result) {
      if (err) {
        throw new Error(err);
      }
      var opts = {};
      opts.sid = req.headers.sid;
      opts.body = result;
      //events.handle(opts);
      //console.log(JSON.stringify(result, null, 2));
      console.log("PARSED XML");
      next();
    });
  });
});

var server = app.listen(opts2.port);

var Parser = function(opts) {
  this.opts = opts;
};

Parser.prototype.parse = function(xml, callback) {
  var root = {};
  this.parseHelper(xml, root, callback);
};

Parser.prototype.walkObject = function(root, result) {
  for (key in result) {
    var val = result[key];
    if (typeof val === 'string' && val[0] === '<') {
      root[key] = {};
      this.parseHelper(val, root[key]);
    } else if (typeof val === 'object') {
      root[key] = {};
      this.walkObject(root[key], val);
    } else {
      root[key] = val;
    }
  }
};

Parser.prototype.parseHelper = function(xml, root, callback) {
  var that = this;
  xml2js.parseString(xml, this.opts, function(err, result) {
    if (err) {
      throw err;
    }
    that.walkObject(root, result);
    if (callback) {
      callback(err, root);
    }
  });
};
