var config = require('./config'),
    http = require('http'),
    ssdp = require('node-ssdp').Client,
    url = require('url'),
    xml2js = require('xml2js');

var options = config.getOptions();

// Options for xml2js parsing.
var xml2jsOptions = {
  explicitArray: false,
  mergeAttrs: true
};

// Retrieve the name of the speaker we wish to find.
if (!options.speakerName) {
  // Speaker name must be specified.
  console.error('No speaker name specified!');
  return;
}

// Use ssdp to find a single Sonos server. Any Sonos server will do. The rest
// of the Sonos data will be retrieved from the Sonos speaker itself.
var getOneSonosServer = function() {
  var client = new ssdp();

  client.on('response', function(headers, code, rinfo) {
    // Since we only need a single Sonos IP, stop processing after we receive
    // the first one.
    client._stop();
    // Retrieve the Sonos topology from the one speaker.
    getSonosTopology(rinfo.address);
  });

  // Search for Sonos speakers only.
  client.search('urn:schemas-upnp-org:device:ZonePlayer:1');
};

// Retreive and parse the entire Sonos topology.
var getSonosTopology = function(ip) {
  // Sonos topology can be retrieved as xml from this url.
  var url = 'http://' + ip + ':1400/status/topology';
  http.get(url, function(response) {
    var body = '';

    response.on('error', function() {
      console.error('Error retrieving topology from ' + url);
    });

    response.on('data', function(data) {
      body += data;
    });

    response.on('end', function() {
      if (response.statusCode !== 200) {
        console.error(body);
        return;
      }

      xml2js.parseString(body, xml2jsOptions, function(err, xmlAsJson) {
        // Send the parsed xml on for further processing.
        processZonePlayers(xmlAsJson);
      });
    });
  });
};

// Parse the uuid of the group's controller from the xml value.
var parseGroup = function(val) {
  return val.split(':')[0];
};

// Parse the ip of the speaker from the description url.
var parseIp = function(val) {
  return url.parse(val).hostname;
};

// Parse the zone player information and find the correct coordinator.
var processZonePlayers = function(data) {
  var uuids = {};
  var currentUuid = null;

  // Parse the zone player data into an easy-to-read map.
  var zonePlayers = data.ZPSupportInfo.ZonePlayers.ZonePlayer;
  for (var i = 0; i < zonePlayers.length; i++) {
    var zp = zonePlayers[i];
    var name = zp._;
    var group = parseGroup(zp.group);
    var coordinator = (zp.coordinator === 'true');
    var ip = parseIp(zp.location);
    var uuid = zp.uuid;
    var item = {
      'name': name,
      'group': group,
      'coordinator': coordinator,
      'ip': ip,
      'uuid': uuid
    };

    if (coordinator) {
      uuids[group] = item;
    }

    // Oh and if we found a matching speaker name, save this uuid for future
    // reference.
    if (name === options.speakerName) {
      currentUuid = item;
    }
  }

  // Find the ip of the coordinator for this speaker.
  var cip = findCoordinator(currentUuid, uuids);
  if (cip) {
    console.log(cip);
    return;
  }

  // Throw an error if no coordinator is found.
  console.error('Could not find coordinator for speaker named "%s".',
      options.speakerName);
};

// Finds the coordinator for the given uuid.
var findCoordinator = function(currentUuid, uuids) {
  if (!currentUuid) {
    // No current uuid, return null;
    return null;
  }
  return uuids[currentUuid.group].ip;
};

// Let's go!
getOneSonosServer();
