var DEFAULT_ALBUM_ART = 'images/default-album-art.png';
var TRANSPARENT_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=';

var UIController = function() {
};

UIController.clearAlbumArt = function() {
  UIController.updateAlbumArt(TRANSPARENT_PNG);
};

UIController.updateAlbumArt = function(albumArt) {
  albumArt = albumArt || DEFAULT_ALBUM_ART;
  document.body.style.backgroundImage = 'url(' + albumArt + ')';
  document.getElementById('albumArt').src = albumArt;
};

// The last.fm API returns many different image sizes. The smaller images 
// are lower resolution but load faster, while the higher resolution images
// take longer to load, but look better. Progressively loading the album
// art shows an image quickly, and then improve that image as the larger
// sizes are loaded.
//
// The albumArtList input parameter is expected to be a list of image urls,
// ordered from smallest to largest.
UIController.progressiveAlbumArt = function(albumArtList) {
  if (!albumArtList || albumArtList.length === 0) {
    // There is no album art, show the default album art.
    UIController.updateAlbumArt();
    return;
  }
  if (albumArtList.length === 1) {
    // There is only one image, no need to progressively display images.
    UIController.updateAlbumArt(albumArtList[0]);
    return;
  }
  albumArtList = albumArtList.slice(0);
  // There are multiple images, show each image, and then load the next
  // image once the previous one is done loading.
  var albumArt = albumArtList.shift();
  UIController.updateAlbumArt(albumArt);
  var img = new Image();
  img.src = albumArt;
  img.addEventListener("load", function() {
    UIController.updateAlbumArt(albumArt);
    if (albumArtList.length > 0) {
      albumArt = albumArtList.shift();
      img.src = albumArt;
    }
  });
};

UIController.showTrackData = function(data) {
  document.getElementById('title').innerHTML = data.title || '';
  document.getElementById('artist').innerHTML = data.artist || '';
  document.getElementById('album').innerHTML = data.album || '';
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

