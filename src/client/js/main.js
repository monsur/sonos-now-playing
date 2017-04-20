var currentTrack = null;
var albumArtCache = new MemoryCache(
    new LastFmAlbumArt(options.lastFmApiKey,
      new SonosAlbumArt()));
var socket = io.connect();
var isPlaying = false;

var logErrorOnServer = function(data) {
  console.log(data);
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
  if (error && error.stack) {
    data.stack = error.stack;
  }
  logErrorOnServer(data);
};

var albumEquals = function(track1, track2) {
  if (!track1 || !track2) {
    return false;
  }
  return track1.artist === track2.artist &&
      track1.album === track2.album;
};

// Compares two track objects.
var trackEquals = function(track1, track2) {
  if (!track1 || !track2) {
    return false;
  }
  return track1.title === track2.title &&
      albumEquals(track1, track2);
};

socket.on('refresh', function(data) {
  location.reload(true);
});

socket.on('newTrack', function(data) {
  if (!data) {
    logErrorOnServer('ERROR: Recieved empty data from server');
    return;
  }

  if (!albumEquals(currentTrack, data) || !UIController.isSonosMode) {
    UIController.checkpoint();
    UIController.showSonos();
    UIController.clearAlbumArt();
    albumArtCache.get(data, function(err, albumArt) {
      if (err) {
        longErrorOnServer(err);
        return;
      }
      UIController.progressiveAlbumArt(albumArt);
    });
  }
  if (!trackEquals(currentTrack, data)) {
    UIController.showTrackData(data);
    currentTrack = data;
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
