var AlbumArtCache = function(proxyCache) {
  this.cache = {};
  this.proxyCache = proxyCache;
};

AlbumArtCache.prototype.add = function(artist, album, data) {
  if (!(artist in this.cache)) {
    this.cache[artist] = {};
  }
  this.cache[artist][album] = data;
};

AlbumArtCache.prototype.lookup = function(artist, album) {
  if (this.cache[artist]) {
    return this.cache[artist][album];
  }
  return undefined;
};

AlbumArtCache.prototype.get = function(artist, album, callback) {
  var that = this;

  var data = this.lookup(artist, album);
  if (data) {
    return callback(null, data);
  }

  this.proxyCache.get(artist, album, function(err, data) {
    if (err) {
      return callback(err, null);
    }
    that.add(artist, album, data);
    return callback(null, data);
  });
};

