var NotificationParser = require('./notification-parser');

var NotificationHandler = function(logger, callback) {
  this.logger = logger;
  this.callback = callback;
};

NotificationHandler.prototype.handle = function(req, res, next) {
  this.logger.info('Received notification from %s', req.connection.remoteAddress);
  var that = this;
  var parser = new NotificationParser();
  parser.open(function(data) {
    if (!data) {
      return;
    }
    that.callback(data);
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

module.exports = NotificationHandler;
