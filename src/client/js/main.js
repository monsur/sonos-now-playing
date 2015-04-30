var currentTrack = null;
var previousTracks = [];
var albumArtCache = new MemoryCache(new LastFmAlbumArt(options.lastFmApiKey));
var socket = io.connect();
var isPlaying = false;

// Log unhandled exceptions.
window.onerror = function(message, url, line, column, error) {
  var data = {};
  data.message = message;
  data.url = url;
  data.line = line;
  data.column = column;
  data.stack = error.stack;

  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/error');
  xhr.send(JSON.stringify(data));
};

// Compares two track objects.
var trackEquals = function(track1, track2) {
  if (!track1 || !track2) {
    return false;
  }
  return track1.title === track2.title &&
      track1.artist === track2.artist &&
      track1.album === track2.album;
};

var hasAlbumInfo = function(data) {
  return data.title && data.artist && data.album;
};

socket.on('refresh', function(data) {
  location.reload(true);
});

socket.on('newTrack', function(data) {
  if (!data) {
    // TODO: Log this server side
    console.log('ERROR: Recieved empty data from server');
    return;
  }

  if (hasAlbumInfo(data) && !trackEquals(currentTrack, data)) {
    UIController.clearAlbumArt();
    UIController.showTrackData(data);
    previousTracks.unshift(currentTrack);
    currentTrack = data;

    albumArtCache.get(data, function(err, albumArt) {
      if (err) {
        // TODO: Log error server-side.
        console.log(err);
      }
      UIController.updateAlbumArt(albumArt);
    });
  }

  if ('isPlaying' in data) {
    isPlaying = data.isPlaying;
    UIController.updateState(data.isPlaying);
  }
});

socket.on('disconnect', function() {
  UIController.showDisconnectIcon();
});

socket.on('reconnect', function() {
  UIController.hideDisconnectIcon();
});

document.getElementById('play').addEventListener('click', function(evt) {
  socket.emit('play', {state: !isPlaying});
});

document.getElementById('next').addEventListener('click', function(evt) {
  socket.emit('next');
});
