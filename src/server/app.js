var Actions = require('./actions');
var config = require('./config');
var express = require('express');
var http = require('http');
var RecursiveXml2Js = require('./recursive-xml2js');
var Screensaver = require('./screensaver');
var socketio = require('socket.io');
var SonosEvent = require('./event');

// The number of connected clients.
var connections = 0;

var options = config.getOptions();

var getIsPlaying = function(state) {
  if (state === 'STOPPED' || state === 'PAUSED_PLAYBACK') {
    return false;
  } else if (state === 'PLAYING') {
    return true;
  }
  return null;
};

var screensaver = new Screensaver({
  timeout: 900,
});
screensaver.check();

var statusEvent = new SonosEvent({
  speakerIp: options.speakerIp,
  speakerPort: options.speakerPort,
  path: '/MediaRenderer/AVTransport/Event',
  callbackUrl: options.callbackUrl,
  handler: function(err, result) {
    if (err) {
      throw new Error(err);
    }

    var source = result['e:propertyset']['e:property'].LastChange.Event.InstanceID;
    var metadata = source.CurrentTrackMetaData.val['DIDL-Lite'].item;

    var data = {};
    var state = source.TransportState.val;
    data.transportState = state;
    data.title = metadata['dc:title'];
    data.album = metadata['upnp:album'];
    data.artist = metadata['dc:creator'];

    if (state === 'STOPPED' || state === 'PAUSED_PLAYBACK') {
      data.isPlaying = false;
    } else if (state === 'PLAYING') {
      data.isPlaying = true;
    }

    io.sockets.emit('newTrack', data);
  }
});

var actions = new Actions({
  speakerIp: options.speakerIp,
  speakerPort: options.speakerPort});

var app = express();
app.use(express.static(__dirname + '/static'));
app.notify(options.callbackPath, function(req, res, next) {

  var body = '';
  req.on('data', function(chunk) {
    body += chunk.toString();
  });
  req.on('end', function() {
    // Respond to the request first so we don't keep Sonos waiting.
    res.writeHead(200);
    res.end();

    var parser = new RecursiveXml2Js();
    parser.parse(body, function(err, result) {
      screensaver.check();
      statusEvent.handle(err, result);
    });
  });

});
app.get('/js/config.js', config.getHandler(options));
app.get('/refresh', function(req, res, next) {
  io.sockets.emit('refresh', {});
  res.writeHead(200);
  res.end();
});
app.get('/health', function(req, res, next) {
  res.writeHead(200);
  res.end('OK');
});
var server = app.listen(options.port);

var io = socketio.listen(server);
io.sockets.on('connection', function(socket) {

  connections++;
  if (connections === 1) {
    statusEvent.subscribe();
  }

  socket.on('play', function(data) {
    if (data.state) {
      actions.play();
    } else {
      actions.pause();
    }
  });

  socket.on('next', function(data) {
    actions.next();
  });

  socket.on('disconnect', function() {
    connections--;
    if (connections === 0) {
      statusEvent.unsubscribe();
    }
  });
});
