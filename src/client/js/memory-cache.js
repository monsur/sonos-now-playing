var MemoryCache = function(proxyCache) {
  this.cache = {};
  this.proxyCache = proxyCache;
};

MemoryCache.prototype.getKey = function(data) {
  return data.artist + '|' + data.album;
};

MemoryCache.prototype.get = function(data, callback) {
  callback = callback || function() {};
  var key = this.getKey(data);
  var val = this.cache[key];
  if (val) {
    return callback(null, val);
  }

  if (this.proxyCache) {
    var that = this;
    this.proxyCache.get(data, function(err, result) {
      if (err) {
        return callback(err, null);
      }
      that.cache[key] = result;
      return callback(null, result);
    });
  } else {
    callback();
  }
};

