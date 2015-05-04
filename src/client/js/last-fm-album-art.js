var LastFmAlbumArt = function(apiKey, proxyCache) {
  this.apiKey = apiKey;
  this.proxyCache = proxyCache;
};

LastFmAlbumArt.prototype.createUrl = function(artist, album) {
  var url = 'http://ws.audioscrobbler.com/2.0/?method=album.getinfo&format=json';
  url += '&api_key=' + encodeURIComponent(this.apiKey);
  url += '&artist=' + encodeURIComponent(artist);
  url += '&album=' + encodeURIComponent(album);
  return url;
};

LastFmAlbumArt.prototype.getImage = function(resp) {
  if (resp && resp.album && resp.album.image) {
    var images = resp.album.image;
    var image = null;
    for (var i = 0; i < images.length; i++) {
      if (images[i].size == 'mega') {
        // Skip the mega image, since its way to big (multiple MB in size).
        continue;
      }
      image = images[i]['#text'];
    }
    return image;
  }
  return null;
};

LastFmAlbumArt.prototype.processResponse = function(responseText, data, callback) {
  var resp = null;

  try {
    resp = JSON.parse(responseText);
  } catch(e) {
    return callback(e, null);
  }

  var image = this.getImage(resp);
  if (image) {
    return callback(null, image);
  }

  if (this.proxyCache) {
    this.proxyCache.get(data, callback);
  } else {
    callback();
  }
};

LastFmAlbumArt.prototype.get = function(data, callback) {
  callback = callback || function() {};

  if (!data.artist || !data.album) {
    // If there is no artist or album info (like from a radio track),
    // skip loading data from last.fm.
    // TODO: Move this proxy cache stuff into its own function.
    if (this.proxyCache) {
      this.proxyCache.get(data, callback);
    } else {
      callback();
    }
    return;
  }

  var url = this.createUrl(data.artist, data.album);
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.timeout = 5000;

  xhr.onerror = function() {
    return callback({
        'msg': 'last.fm error',
        'status': xhr.status,
        'statusText': xhr.statusText}, null);
  };

  var that = this;
  xhr.onload = function() {
    that.processResponse(xhr.responseText, data, callback);
  };

  xhr.send();
};

