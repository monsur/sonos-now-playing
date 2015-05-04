var currentTrack = null;
var previousTracks = [];
var albumArtCache = new MemoryCache(
    new LastFmAlbumArt(options.lastFmApiKey,
      new SonosAlbumArt()));
var socket = io.connect();
var isPlaying = false;

var logErrorOnServer = function(data) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/error');
  xhr.send(JSON.stringify(data));
};

// Log unhandled exceptions.
window.onerror = function(message, url, line, column, error) {
  var data = {};
  if (message) {
    data.message = message;
  }
  if (url) {
    data.url = url;
  }
  if (line) {
    data.line = line;
  }
  if (column) {
    data.column = column;
  }
  if (stack) {
    data.stack = error.stack;
  }
  logErrorOnServer(data);
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

socket.on('refresh', function(data) {
  location.reload(true);
});

socket.on('newTrack', function(data) {
  if (!data) {
    logErrorOnServer('ERROR: Recieved empty data from server');
    return;
  }

  if (!trackEquals(currentTrack, data)) {
    UIController.clearAlbumArt();
    UIController.showTrackData(data);
    previousTracks.unshift(currentTrack);
    currentTrack = data;

    albumArtCache.get(data, function(err, albumArt) {
      if (err) {
        longErrorOnServer(err);
        return;
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
