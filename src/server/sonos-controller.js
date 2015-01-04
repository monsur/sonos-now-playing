
var port = 1400;

var SonosController = function(speakerIp) {
  this.speakerIp = speakerIp;
}

SonosController.prototype.subscribe = function(callback) {
};

SonosController.prototype.renew = function(callback) {
};

SonosController.prototype.unsubscribe = function(callback) {
};

SonosController.prototype.play = function(callback) {
};

SonosController.prototype.pause = function(callback) {
};

SonosController.prototype.next = function(callback) {
};

module.exports = SonosController;

