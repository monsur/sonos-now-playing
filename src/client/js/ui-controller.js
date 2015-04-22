var DEFAULT_ALBUM_ART = 'images/default-album-art.png';

var UIController = function() {
};

UIController.clearAlbumArt = function() {
  UIController.updateAlbumArt('images/1x1.png');
};

UIController.updateAlbumArt = function(albumArt) {
  albumArt = albumArt || DEFAULT_ALBUM_ART;
  document.body.style.backgroundImage = 'url(' + albumArt + ')';
  document.getElementById('albumArt').src = albumArt;
};

UIController.showTrackData = function(data) {
  document.getElementById('title').innerHTML = data.title;
  document.getElementById('artist').innerHTML = data.artist;
  document.getElementById('album').innerHTML = data.album;
  document.getElementById('content').style.display = 'block';
};

UIController.updateState = function(isPlaying) {
  if (isPlaying) {
    document.getElementById('playbutton').style.display = 'none';
  } else {
    document.getElementById('playbutton').style.display = 'block';
  }
};

UIController.showDisconnectIcon = function() {
  document.getElementById('disconnect').style.display = 'block';
};

UIController.hideDisconnectIcon = function() {
  document.getElementById('disconnect').style.display = 'none';
};

