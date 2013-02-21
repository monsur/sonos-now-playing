var http = require('http')
  , socketio = require('socket.io')
  , fs = require('fs')
  , sax = require("./sax");


var NotificationParser = function() {
  this.parser = this.createParser();
};

NotificationParser.prototype.createParser = function() {
  var that = this;
  var parser = sax.parser(true);

  parser.ontext = function(t) {
    if (parser.tag.name === 'LastChange') {
      var parser2 = sax.parser(true);

      parser2.onopentag = function(node) {
        if (node.name === 'CurrentTrackMetaData' &&
            'val' in node.attributes) {
          var val = node.attributes['val'];
          var parser3 = sax.parser(true);
          var title = null;
          var artist = null;
          var album = null;
          var streamTitle = null;

          parser3.ontext = function(t) {
            var name = parser3.tag.name;
            if (name === 'dc:title') {
              title = t;
            } else if (name === 'dc:creator') {
              artist = t;
            } else if (name === 'upnp:album') {
              album = t;
            } else if (name === 'r:streamContent') {
              streamTitle = t;
            }
          };

          parser3.onend = function() {
            // TODO: Fix stream parsing (title not loaded properly)
            if (title === 'stream') {
              title = streamTitle;
            }
            var data = null;
            if (title) {
              data = {};
              data['title'] = title;
              data['artist'] = artist;
              data['album'] = album;
            }
            emit(data);
          };

          parser3.write(val).close();
        }
      }

      parser2.write(t).close();
    }
  };

  return parser;
};

NotificationParser.prototype.addChunk = function(data) {
  this.parser.write(data);
}

NotificationParser.prototype.end = function() {
  this.parser.close();
};


var UpnpPublisher = function(ip) {
  this.ip = ip;
  this.sid = null;
  this.timeout = UpnpPublisher.DEFAULT_TIMEOUT;
  this.notification = new NotificationParser();
};

UpnpPublisher.DEFAULT_TIMEOUT = 86400;
UpnpPublisher.TIMEOUT_PREFIX = 'Second-';

UpnpPublisher.prototype.handleError = function(callback, msg, fields) {
  fields = fields || {};
  fields.error = msg;
  callback(fields);
};

UpnpPublisher.prototype.handleHttpError = function(callback, status, headers) {
  var error = null;
  if (status === 400) {
    error = 'Incompatible header fields';
  } else if (status === 412) {
    error = 'Precondition failed';
  } else if (status >= 500) {
    error = 'Unable to accept renewal';
  }
  if (error) {
    this.handleError(callback, error, {
      'statusCode': status,
      'headers': headers
    });
    return true;
  }
  return false;
};

UpnpPublisher.prototype.getRequestOptions = function(method, headers) {
  return {
    method: method,
    hostname: this.ip,
    port: 1400,
    path: '/MediaRenderer/AVTransport/Event',
    headers: headers
  }
};

UpnpPublisher.prototype.subscribe = function(callbackUrl, callback) {
  callbackUrl = callbackUrl || null;
  callback = callback || function() {};

  if (this.sid) {
    return this.handleError(callback, 'Already subscribed with SID "' + this.sid + '".');
  }
  if (!callbackUrl) {
    return this.handleError(callback, 'callbackUrl is required.');
  }

  this.subscribeInternal({
      'CALLBACK': '<' + callbackUrl + '>',
      'NT': 'upnp:event'
    }, callback);
};

UpnpPublisher.prototype.notify = function(data) {
  this.notification.addChunk(data);
};

UpnpPublisher.prototype.notifyEnd = function() {
  this.notification.end();
};

UpnpPublisher.prototype.scheduleRenew = function() {
  var that = this;
  setTimeout(function() {
    that.renew();
  }, this.timeout);
};

UpnpPublisher.prototype.renew = function(callback) {
  callback = callback || function() {};

  if (!this.sid) {
    return this.handleError(callback, 'No subscription.');
  }

  this.subscribeInternal({
      'SID': this.sid,
      'TIMEOUT': UpnpPublisher.TIMEOUT_PREFIX + (this.timeout || UpnpPublisher.DEFAULT_TIMEOUT)
    }, callback);
};

UpnpPublisher.prototype.subscribeInternal = function(headers, callback) {
  var that = this;

  var options = this.getRequestOptions('SUBSCRIBE', headers);
  var req = http.request(options, function(res) {
    var headers = res.headers;
    var status = res.statusCode;
    if (that.handleHttpError(callback, status, headers)) {
      return;
    }

    if ('sid' in headers) {
      that.sid = headers['sid'];
    }
    if ('timeout' in headers) {
      that.timeout = parseInt(headers['timeout'].substr(UpnpPublisher.TIMEOUT_PREFIX.length));
    }

    callback({
      'sid': that.sid,
      'timeout': that.timeout
    });

    that.scheduleRenew();
  });

  req.on('error', function(e) {
    console.log(e.message);
  });

  req.end();
};

UpnpPublisher.prototype.unsubscribe = function(callback) {
  var that = this;
  callback = callback || function() {};

  if (!this.sid) {
    return this.handleError(callback, 'No subscription.');
  }

  var options = this.getRequestOptions('UNSUBSCRIBE', {
      'SID': this.sid
    });
  var req = http.request(options, function(res) {
    var headers = res.headers;
    var status = res.statusCode;
    if (that.handleHttpError(callback, status, headers)) {
      return;
    }

    this.sid = null;
    callback({});
  });

  req.on('error', function(e) {
    console.log(e.message);
  });

  req.end();
};


// Container for any variables that can be specified by the user.
var OPTIONS = {
  port: 8080,
  speakerIp: '192.168.1.128',
  timeout: 1000,
  callback: '/upnp/notify'
};


// Container for any global variable (because I don't like putting crap in the
// global namespace).
var GLOBALS = {
  connections: 0,
  currentTrack: null,
  timeoutId: null
};


// Compares two track objects.
var trackEquals = function(track1, track2) {
  if (!track1 || !track2) {
    return false;
  }
  return track1.title === track2.title &&
      track1.artist === track2.artist &&
      track1.album === track2.album;
};


var parseCommandLine = function() {
  var args = process.argv;
  for (var i = 0; i < args.length; i++) {
    var arg = args[i];
    if (arg.indexOf('--') === 0) {
      var key = arg.substr(2);
      var val = args[++i];
      OPTIONS[key] = val;
    }
  }
  for (key in OPTIONS) {
    var val = OPTIONS[key];
    console.log(key + ': ' + val);
  }
};


var subscribe = function(callback) {
  // TODO: Dynamically load local IP.
  upnp.subscribe('http://192.168.1.197:' + OPTIONS.port + OPTIONS.callback, callback);
};

var unsubscribe = function(callback) {
  upnp.unsubscribe(callback);
};


// Start the server.
parseCommandLine();

var upnp = new UpnpPublisher(OPTIONS.speakerIp);

var app = http.createServer(function(req, res) {
  req.setEncoding('utf8');
  var url = req.url;
  if (url === OPTIONS.callback) {
    req.on('data', function(chunk) {
      // TODO: Create/Call NotificationParser directly.
      upnp.notify(chunk);
    });
    req.on('end', function(chunk) {
      upnp.notifyEnd();
      res.writeHead(200);
      res.end();
    });
    return;
  }

  fs.readFile(__dirname + url, function(err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading ' + url);
    }

    res.writeHead(200);
    res.end(data);
  });
});

var io = socketio.listen(app);
io.sockets.on('connection', function(socket) {
  GLOBALS.connections++;
  if (GLOBALS.connections === 1) {
    subscribe();
  }

  socket.on('disconnect', function() {
    GLOBALS.connections--;
    if (GLOBALS.connections === 0) {
      unsubscribe();
    }
  });
});

var emit = function(data) {
  io.sockets.emit('newTrack', data);
};

app.listen(OPTIONS.port);
