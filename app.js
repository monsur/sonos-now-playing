var http = require('http')
  , socketio = require('socket.io')
  , fs = require('fs')
  , sax = require("./sax");


// Container for any variables that can be specified by the user.
var OPTIONS = {
  port: 8080,
  speakerIp: '192.168.1.128',
  timeout: 1000
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


// Polls Sonos for the current track.
// Only runs if there are socket.io clients connected.
var pollCurrentTrack = function() {
  // If there are no conneted clients, don't do anything.
  if (GLOBALS.connections === 0) {
    return;
  }

  // Callback to call after loading the track.
  // Emits the current track to the client (if it is a different track).
  // Calls the pollCurrentTrack() method after a specified interval.
  var callback = function(data) {
    if (data) {
      GLOBALS.currentTrack = data;
      emitCurrentTrack();
    }
    GLOBALS.timeoutId = setTimeout(pollCurrentTrack, OPTIONS.timeout);
  };

  // Ping Sonos for current track.
  getCurrentTrackFromSonos(function(data) {
    if (!data ||
        trackEquals(GLOBALS.currentTrack, data)) {
      return callback();
    }
    return callback(data);
  });
};


// Emit the current track on the given socket.
// If socket isn't specified, emits to all clients.
var emitCurrentTrack = function(opt_socket) {
  if (!GLOBALS.currentTrack) {
    return;
  }
  var socket = opt_socket || io.sockets;
  socket.emit('newTrack', GLOBALS.currentTrack);
};


// Creates a SAX parser to parse the SOAP response.
var createParser = function(callback) {
  // Stores the track information.
  var data = {};
  var title = null;
  var streamTitle = null;

  var parser = sax.parser(true);

  parser.ontext = function(t) {
    if (parser.tag.name === 'TrackMetaData') {
      var parser2 = sax.parser(true);
      parser2.ontext = function(t) {
        var name = parser2.tag.name;
        if (name === 'dc:title') {
          title = t;
        } else if (name === 'dc:creator') {
          data['artist'] = t;
        } else if (name === 'upnp:album') {
          data['album'] = t;
        } else if (name === 'r:streamContent') {
          streamTitle = t;
        }
      };
      parser2.write(t).close();
    }
  };

  parser.onend = function() {
    if (title === 'stream') {
      // If this is a radio stream, title is the stream title.
      // There is no other data associated with streams.
      title = streamTitle;
    }
    data['title'] = title;

    // No title means no data. Set data to null.
    if (title === null) {
      data = null;
    }

    callback.call(null, data);
  };

  return parser;
};


// Sends a SOAP request to the SONOS to retrieve the current track.
var getCurrentTrackFromSonos = function(callback) {
  var parser = createParser(callback);

  var body = '<?xml version="1.0" encoding="UTF-8"?><env:Envelope xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:wsdl="http://www.sonos.com/Services/1.1" xmlns:env="http://schemas.xmlsoap.org/soap/envelope/"><env:Body><wsdl:GetPositionInfo><u:GetPositionInfo xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><Speed>1</Speed></u:GetPositionInfo></wsdl:GetPositionInfo></env:Body></env:Envelope>';

  var req = http.request({
    method: 'POST',
    hostname: OPTIONS.speakerIp,
    port: 1400,
    path: '/MediaRenderer/AVTransport/Control',
    headers: {
      'Content-Type': 'text/xml',
      'Content-Length': body.length,
      'SOAPACTION': '"urn:schemas-upnp-org:service:AVTransport:1#GetPositionInfo"'
    }
  }, function(res) {
    res.setEncoding('utf8');
    var data = '';
    res.on('data', function(chunk) {
      parser.write(chunk);
      data += chunk;
    });
    res.on('end', function() {
      parser.close();
      console.log(data);
    });
  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

  req.write(body);

  req.end();
};


// Create the HTTP server.
var createHttpServer = function() {
  return http.createServer(function(req, res) {
    var url = req.url;
    fs.readFile(__dirname + url,
    function(err, data) {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading ' + url);
      }

      res.writeHead(200);
      res.end(data);
    });
  });
};


// Create/Configure sockets.io
var createSocketIo = function(app) {
  var io = socketio.listen(app);
  io.sockets.on('connection', function(socket) {
    GLOBALS.connections++;
    // Send the current track to the new client immediately.
    emitCurrentTrack(socket);
    if (GLOBALS.connections === 1) {
      // If this is the first client, begin polling.
      pollCurrentTrack();
    }

    socket.on('disconnect', function() {
      GLOBALS.connections--;
      if (GLOBALS.connections === 0) {
        // If there are no more clients, clear out the current track so it
        // doesn't go stale.
        // Stop polling.
        GLOBALS.currentTrack = null;
        if (GLOBALS.timeoutId) {
          clearTimeout(GLOBALS.timeoutId);
        }
      }
    });
  });
  return io;
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
}

// Start the server.
parseCommandLine();
var app = createHttpServer();
var io = createSocketIo(app);
app.listen(OPTIONS.port);
