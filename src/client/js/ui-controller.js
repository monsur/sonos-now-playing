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

UIController.updateState = function(isPlaying) {
  if (isPlaying) {
    document.getElementById('playbutton').style.display = 'none';
  } else {
    document.getElementById('playbutton').style.display = 'block';
  }
};
