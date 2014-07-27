var NotificationParser = require('./notification-parser');

var NotificationHandler = function(logger, callback) {
  this.logger = logger;
  this.callback = callback;
};

NotificationHandler.prototype.handle = function(req, res, next) {
  this.logger.info('Received notification from %s', req.connection.remoteAddress);
  var parser = new NotificationParser();
  parser.open(this.callback);
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
