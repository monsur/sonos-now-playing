var http = require('http'),
  express = require('express'),
  logger = require('little-logger'),
  socketio = require('socket.io'),
  config = require('./config'),
  ActionController = require('./action-controller'),
  SonosEvent = require('./event'),
  RecursiveXml2Js = require('./recursive-xml2js');

var getCallbackUrl = function(ip, port, callbackPath) {
  return 'http://' + ip + ':' + port + callbackPath;
};

// The number of connected clients.
var connections = 0;

var options = config.getOptions();

var logger = new logger.Logger(options.loglevel, {
    format: '   %l  - %a'
});

var statusEvent = new SonosEvent({
  speakerIp: options.speakerIp,
  port: options.speakerPort,
  path: '/MediaRenderer/AVTransport/Event',
  callbackUrl: getCallbackUrl(options.ip, options.port, options.callbackPath),
  handler: function(err, result) {
    if (err) {
      throw new Error(err);
    }

    var source = result['e:propertyset']['e:property'].LastChange.Event.InstanceID;
    var metadata = source.CurrentTrackMetaData.val['DIDL-Lite'].item;

    var data = {};
    data.transportState = source.TransportState.val;
    data.title = metadata['dc:title'];
    data.album = metadata['upnp:album'];
    data.artist = metadata['dc:creator'];

    console.log(data);
    io.sockets.emit('newTrack', data);
  }
});

var actions = new ActionController(options.speakerIp, options.speakerPort, logger);

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
    console.log(data);
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
