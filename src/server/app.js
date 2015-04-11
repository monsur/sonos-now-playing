var http = require('http'),
  express = require('express'),
  logger = require('little-logger'),
  socketio = require('socket.io'),
  config = require('./config'),
  SonosController = require('./sonos-controller'),
  SonosEvent = require('./event');

// The number of connected clients.
var connections = 0;

var options = config.getOptions();

var logger = new logger.Logger(options.loglevel, {
    format: '   %l  - %a'
});

var sonos = new SonosController(options, logger);

var statusEvent = // TODO

var notificationHandler = new NotificationHandler(logger, function(data) {
  io.sockets.emit('newTrack', data);
});

var app = express();
app.use(express.static(__dirname + '/static'));
app.notify(options.callbackPath, function(req, res, next) {
  notificationHandler.handle(req, res, next);
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
    sonos.subscribe();
  }

  socket.on('play', function(data) {
    sonos.togglePlay(data.state);
  });

  socket.on('next', function(data) {
    sonos.next();
  });

  socket.on('disconnect', function() {
    connections--;
    if (connections === 0) {
      sonos.unsubscribe();
    }
  });
});
