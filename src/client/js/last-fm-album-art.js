var LastFmAlbumArt = function(apiKey) {
  this.apiKey = apiKey;
};

LastFmAlbumArt.prototype.createUrl = function(artist, album) {
  var url = 'http://ws.audioscrobbler.com/2.0/?method=album.getinfo&format=json';
  url += '&api_key=' + encodeURIComponent(this.apiKey);
  url += '&artist=' + encodeURIComponent(artist);
  url += '&album=' + encodeURIComponent(album);
  return url;
};

LastFmAlbumArt.getData = function(resp) {
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
    var data = {};
    data.albumArt = image;
    return data;
  }
  return null;
};

LastFmAlbumArt.processResponse = function(responseText, callback) {
  var resp = null;

  try {
    resp = JSON.parse(responseText);
  } catch(e) {
    return callback(e, null);
  }

  var data = LastFmAlbumArt.getData(resp);
  if (data) {
    return callback(null, data);
  } else {
    return callback(resp, null);
  }
};

LastFmAlbumArt.prototype.get = function(artist, album, callback) {
  var url = this.createUrl(artist, album);
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.timeout = 5000;

  xhr.onerror = function() {
    return callback({
        'msg': 'last.fm error',
        'status': xhr.status,
        'statusText': xhr.statusText}, null);
  };

  xhr.onload = function() {
    LastFmAlbumArt.processResponse(xhr.responseText, callback);
  };

  xhr.send();
};

