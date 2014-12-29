var NotificationParser = require('./notification-parser');

var NotificationHandler = function(logger, callback) {
  this.logger = logger;
  this.callback = callback;
  this.currentTrack = {};
};

NotificationHandler.prototype.handle = function(req, res, next) {
  this.logger.info('Received notification from %s', req.connection.remoteAddress);
  var that = this;
  var parser = new NotificationParser();
  parser.open(function(data) {
    that.processTrack(data);
  });
  req.on('data', function(chunk) {
    // TODO: Investigate if toString() is the right behavior here.
    parser.write(chunk.toString());
  });
  req.on('end', function() {
    parser.close();
    res.writeHead(200);
    res.end();
  });
};

NotificationHandler.prototype.processTrack = function(data) {
  if (this.currentTrack['title'] === data['title'] &&
      this.currentTrack['album'] === data['album'] &&
      this.currentTrack['artist'] === data['artist']) {
    return;
  }
  this.currentTrack = data;
  this.callback(data);
}

NotificationHandler.prototype.getCurrentTrack = function() {
  return this.currentTrack;
};

NotificationHandler.prototype.hasCurrentTrack = function() {
  return 'title' in this.currentTrack;
};

module.exports = NotificationHandler;
