var AlbumArtManager = function() {
  // Sources will always be an array (even if it is empty).
  if (!arguments) {
    this.sources = [];
  } else {
    this.sources = Array.prototype.slice.call(arguments);
  }
};

AlbumArtManager.prototype.get = function(data, callback, pos) {
  pos = pos || 0;
  var that = this;
  this.sources[pos].get(data, function(err, result) {
    if (err) {
      // If there was an error, send it to the callback.
      // Set the result to null just in case the callback was called with both
      // an error and a result.
      // TODO: Log error on server and continue processing sources.
      result = null;
      return callback(err, null);
    }

    if (result) {
      // If there was a result, send it to the callback. We're done processing.
      return callback(null, result);
    }

    pos++;
    if (pos === that.sources.length) {
      // If there is no result and there are no more sources, return null to
      // the callback.
      return callback(null, null);
    }

    // If there was no result, but there are more sources to check,
    // call get on the next source.
    that.get(data, callback, pos);
  });
};
