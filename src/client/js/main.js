var DEFAULT_ALBUM_ART = 'images/default-album-art.png';
var currentTrack = null;
var previousTracks = [];
var albumArtCache = new AlbumArtCache(new LastFmAlbumArt(options.lastFmApiKey));
var screensaver = new Screensaver(options.sleepTimeout, UIController.sleep);
var socket = io.connect();

// Compares two track objects.
var trackEquals = function(track1, track2) {
  if (!track1 || !track2) {
    return false;
  }
  return track1.title === track2.title &&
      track1.artist === track2.artist &&
      track1.album === track2.album;
};

socket.on('newTrack', function(data) {
  if (!data) {
    // TODO: Log this server side
    console.log('ERROR: Recieved empty data from server');
    return;
  }

  if (!trackEquals(currentTrack, data)) {
    albumArtCache.get(data.artist, data.album, function(err, resp) {
      if (err) {
        // TODO: Log error server-side.
        console.log(err);
      } else {
        data.albumArt = resp.albumArt;
      }
      UIController.updateTrack(data);
      previousTracks.unshift(currentTrack);
      currentTrack = data;
      screensaver.start();
    });
  }
});

document.getElementById('play').addEventListener('click', function(evt) {
  console.log('play');
  socket.emit('play');
});

document.getElementById('next').addEventListener('click', function(evt) {
  console.log('next');
  socket.emit('next');
});
