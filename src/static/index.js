var currentTrack = null;
var previousTracks = [];

var createCORSRequest = function(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    // Check if the XMLHttpRequest object has a "withCredentials" property.
    // "withCredentials" only exists on XMLHTTPRequest2 objects.
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != "undefined") {
    // Otherwise, check if XDomainRequest.
    // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    // Otherwise, CORS is not supported by the browser.
    xhr = null;
  }
  return xhr;
}

var AlbumArt = function() {
  this.cache = {};
};

AlbumArt.prototype.add = function(artist, album, data) {
  if (!(artist in this.cache)) {
    this.cache[artist] = {}
  }
  this.cache[artist][album] = data;
};

AlbumArt.prototype.lookup = function(artist, album) {
  if (artist in this.cache) {
    var cache = this.cache[artist];
    if (album in cache) {
      return cache[album];
    }
  }
  return null;
};

AlbumArt.prototype.createUrl = function(artist, album) {
  var url = 'http://ws.audioscrobbler.com/2.0/?method=album.getinfo&format=json';
  url += '&api_key=' + encodeURIComponent(options.lastFmApiKey);
  url += '&artist=' + encodeURIComponent(artist);
  url += '&album=' + encodeURIComponent(album);
  return url;
};

AlbumArt.prototype.get = function(artist, album, callback) {
  var that = this;
  var data = this.lookup(artist, album);
  if (data) {
    callback(data);
    return;
  }

  var url = this.createUrl(artist, album);
  var xhr = createCORSRequest('GET', url);

  xhr.onerror = function() {
    console.log('There was an error!');
  };

  xhr.onload = function() {
    var data = null;
    try {
      data = JSON.parse(xhr.responseText);
    } catch(e) {
      console.log(e);
      return callback();
    }
    if ('error' in data) {
      console.log(data);
      return callback();
    }

    that.add(artist, album, data);
    return callback(data);
  };

  xhr.send();
};

var albumArtCache = new AlbumArt();

var socket = io.connect();
socket.on('newTrack', function(data) {
  if (trackEquals(currentTrack, data)) {
    return;
  }

  if (('artist' in data) && ('album' in data)) {
    albumArtCache.get(data['artist'], data['album'], function(resp) {
      if (!resp || !resp.album || !resp.album.image) {
        updateData(data);
        return;
      }
      var images = resp['album']['image'];
      var image = null;
      for (var i = 0; i < images.length; i++) {
        if (images[i]['size'] == 'mega') {
          // Skip the mega image, since its way to big (multiple MB in size).
          continue;
        }
        image = images[i]['#text'];
      }
      if (image) {
        data['albumArt'] = image;
      }
      updateData(data);
    })
  } else {
    updateData(data);
  }
});

var updateData = function(data) {
  var albumArt = 'default-album-art.png';
  if ('albumArt' in data) {
    albumArt = data.albumArt;
  }
  document.body.style.backgroundImage = 'url(' + albumArt + ')';
  document.getElementById('albumArt').src = albumArt;
  document.getElementById('title').innerHTML = data.title;
  document.getElementById('artist').innerHTML = data.artist;
  document.getElementById('album').innerHTML = data.album;
  document.getElementById('content').style.display = 'block';

  previousTracks.unshift(currentTrack);
  currentTrack = data;
}

// Compares two track objects.
var trackEquals = function(track1, track2) {
  if (!track1 || !track2) {
    return false;
  }
  return track1.title === track2.title &&
      track1.artist === track2.artist &&
      track1.album === track2.album;
};

var sleep = function() {
  document.getElementById('content').style.display = 'none';
  document.body.style.backgroundImage = 'none';
};
