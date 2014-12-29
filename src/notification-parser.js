var sax = require('sax');

var NotificationParser = function() {
};

NotificationParser.prototype.open = function(callback) {
  this.parser = this.createParser();
  this.callback = callback;
}

NotificationParser.prototype.createParser = function() {
  var that = this;
  var parser = sax.parser(true);

  parser.ontext = function(t) {
    if (parser.tag.name === 'LastChange') {
      var parser2 = sax.parser(true);

      var transportState = '';
      parser2.onopentag = function(node) {
        if (node.name === 'TransportState') {
          // TODO: figure out how to short-circuit here.
          transportState = node.attributes['val'];
        } else if (node.name === 'CurrentTrackMetaData') {
          var val = node.attributes['val'];
          var parser3 = sax.parser(true);
          var title = null;
          var artist = null;
          var album = null;

          parser3.ontext = function(t) {
            var name = parser3.tag.name;
            if (name === 'dc:title') {
              title = t;
            } else if (name === 'dc:creator') {
              artist = t;
            } else if (name === 'upnp:album') {
              album = t;
            }
          };

          parser3.onend = function() {
            // TODO: Fix radio stream parsing (schemas are vastly different).
            var data = null;
            if (title) {
              data = {};
              data['title'] = title;
              data['artist'] = artist;
              data['album'] = album;
            }
            if (transportState == 'PLAYING') {
              that.callback(data);
            }
          };

          parser3.write(val).close();
        }
      }

      parser2.write(t).close();
    }
  };

  return parser;
};

NotificationParser.prototype.write = function(data) {
  this.parser.write(data);
}

NotificationParser.prototype.close = function() {
  this.parser.close();
};

module.exports = NotificationParser;
