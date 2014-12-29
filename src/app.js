var http = require('http')
  , express = require('express')
  , socketio = require('socket.io')
  , config = require('./config')
  , logger = require('./little-logger')
  , NotificationHandler = require('./notification-handler')
  , SubscriptionHandler = require('./subscription-handler');

// The number of connected clients.
var connections = 0;

var options = config.getOptions();

var logger = new logger.Logger(options.loglevel, {
    format: '   %l  - %a'
});
var subscriptionHandler = new SubscriptionHandler(options, logger);
var notificationHandler = new NotificationHandler(logger, function(data) {
  io.sockets.emit('newTrack', data);
});

var app = express();
app.use(express.static('static'));
app.notify(options.notificationPath, function(req, res, next) {
  notificationHandler.handle(req, res, next);
});
app.get('/config.js', config.getHandler(options));
var server = app.listen(options.port);

var io = socketio.listen(server);
io.sockets.on('connection', function(socket) {
  connections++;
  if (connections === 1) {
    subscriptionHandler.subscribe();
  } else if (connections > 1) {
    // Give it the current track.
    socket.emit('newTrack', notificationHandler.getCurrentTrack());
  }

  socket.on('disconnect', function() {
    connections--;
    if (connections === 0) {
      subscriptionHandler.unsubscribe();
    }
  });
});
