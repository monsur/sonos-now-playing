var config = require('./config'),
    ssdp = require('node-ssdp').Client,
    Coordinator = require('./coordinator');

var options = config.getOptions();

// Retrieve the name of the speaker we wish to find.
if (!options.speakerName) {
  // Speaker name must be specified.
  console.error('No speaker name specified!');
  return;
}

var coordinator = new Coordinator(options);

// Use ssdp to find a single Sonos server. Any Sonos server will do. The rest
// of the Sonos data will be retrieved from the Sonos speaker itself.
var client = new ssdp();
var state = 0;

client.on('response', function(headers, code, rinfo) {
  // Since we only need a single Sonos IP, stop processing after we receive
  // the first one.
  if (state > 0) {
    return;
  }
  state = 1;

  // Retrieve the Sonos topology from the one speaker.
  coordinator.fromSpeakerIp(rinfo.address, function(err, c) {
    if (err) {
      console.log(err);
    } else {
      console.log(c.ip);
    }
    state = 2;
  });
});

  // Search for Sonos speakers only.
client.search('urn:schemas-upnp-org:device:ZonePlayer:1');

var stop = function() {
  if (state === 2) {
    client.stop();
  } else {
    setTimeout(stop, 100);
  }
};
stop();
