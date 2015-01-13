var UIController = function() {
};

UIController.updateTrack = function(data) {
  var albumArt = data.albumArt || DEFAULT_ALBUM_ART;
  document.body.style.backgroundImage = 'url(' + albumArt + ')';
  document.getElementById('albumArt').src = albumArt;
  document.getElementById('title').innerHTML = data.title;
  document.getElementById('artist').innerHTML = data.artist;
  document.getElementById('album').innerHTML = data.album;
  document.getElementById('content').style.display = 'block';
};

UIController.updateState = function(data) {
  if (!('isPlaying' in data)) {
    return;
  }
};

UIController.sleep = function() {
  document.getElementById('content').style.display = 'none';
  document.body.style.backgroundImage = 'none';
};

