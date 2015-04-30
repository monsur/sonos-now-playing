var SonosAlbumArt = function(proxyCache) {
  this.proxyCache = proxyCache;
};

SonosAlbumArt.prototype.get = function(data, callback) {
  callback = callback || function() {};

  if ('albumArt' in data) {
    return callback(null, data.albumArt);
  }

  if (this.proxyCache) {
    return this.proxyCache.get(data, callback);
  }

  callback();
};
