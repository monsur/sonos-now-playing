var currentTrack = null;
var previousTracks = [];

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
  if (resp && resp['album'] && resp['album']['image']) {
    var images = resp['album']['image'];
    var image = null;
    for (var i = 0; i < images.length; i++) {
      if (images[i]['size'] == 'mega') {
        // Skip the mega image, since its way to big (multiple MB in size).
        continue;
      }
      image = images[i]['#text'];
    }
    var data = {};
    data['albumArt'] = image;
    return data;
  }
  return null;
};

LastFmAlbumArt.prototype.get = function(artist, album, callback) {
  var url = this.createUrl(artist, album);
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);

  xhr.onerror = function() {
    return callback({'msg': 'last.fm error'}, null);
  };

  xhr.onload = function() {
    var resp = null;
    try {
      resp = JSON.parse(xhr.responseText);
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

  xhr.send();
};


var AlbumArtCache = function(proxyCache) {
  this.cache = {};
  this.proxyCache = proxyCache;
};

AlbumArtCache.prototype.add = function(artist, album, data) {
  if (!(artist in this.cache)) {
    this.cache[artist] = {}
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


var Screensaver = function(timeout) {
  this.timeout = timeout || 900000;
  this.currentId = null;
};

Screensaver.sleep = function() {
  document.getElementById('content').style.display = 'none';
  document.body.style.backgroundImage = 'none';
};

Screensaver.prototype.start = function() {
  if (this.currentId) {
    clearTimeout(this.currentId);
    this.currentId = null;
  }
  this.currentId = setTimeout(function() {
    Screensaver.sleep();
  }, this.timeout);
};


var albumArtCache = new AlbumArtCache(new LastFmAlbumArt(options['lastFmApiKey']));
var screensaver = new Screensaver(options.sleepTimeout);

var socket = io.connect();
socket.on('newTrack', function(data) {
  if (trackEquals(currentTrack, data)) {
    return;
  }

  if (('artist' in data) && ('album' in data)) {
    albumArtCache.get(data['artist'], data['album'], function(err, resp) {
      if (err) {
        // TODO: Log error server-side.
        console.log(err);
      } else {
        data['albumArt'] = resp['albumArt'];
      }
      updateData(data);
    });
  }
});

var updateData = function(data) {
  var albumArt = data['albumArt'];
  if (!albumArt) {
    albumArt = 'default-album-art.png';
  }
  document.body.style.backgroundImage = 'url(' + albumArt + ')';
  document.getElementById('albumArt').src = albumArt;
  document.getElementById('title').innerHTML = data.title;
  document.getElementById('artist').innerHTML = data.artist;
  document.getElementById('album').innerHTML = data.album;
  document.getElementById('content').style.display = 'block';

  previousTracks.unshift(currentTrack);
  currentTrack = data;
  screensaver.start();
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

