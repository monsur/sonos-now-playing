var http = require('http');
var url = require('url');
var xml2js = require('xml2js');

var Coordinator = {};

Coordinator.fromSpeakerIp = function(ip, callback) {
  var url = 'http://' + ip + ':1400/status/topology';
  getCoordinatorFromUrl(url, callback);
};

Coordinator.fromUrl = function(url, callback) {
  http.get(url, function(response) {
    var body = '';

    response.on('error', function() {
      callback(new Error('Error retrieving topology from ' + url));
    });

    response.on('data', function(data) {
      body += data;
    });

    response.on('end', function() {
      if (response.statusCode !== 200) {
        console.error(body);
        return;
      }

      getCoordinatorFromXmlString(body, callback);
    });
  });
};

Coordinator.fromXmlString = function(data, callback) {
  // Options for xml2js parsing.
  var xml2jsOptions = {
    explicitArray: false,
    mergeAttrs: true
  };
  xml2js.parseString(data, xml2jsOptions, function(err, xmlAsJson) {
    if (err) {
      return callback(err);
    }
    var coordinator = getCoordinatorFromJson(xmlAsJson);
    callback(null, coordinator);
  });
};

Coordinator.fromJson = function(data) {
  var uuids = {};
  var currentUuid = null;
  var zonePlayers = data.ZPSupportInfo.ZonePlayers.ZonePlayer;

  // Parse the zone player data into an easy-to-read map.
  for (var i = 0; i < zonePlayers.length; i++) {
    var zp = zonePlayers[i];
    var name = zp._;
    var group = zp.group.split(':')[0];
    var coordinator = (zp.coordinator === 'true');
    var ip = url.parse(zp.location).hostname;
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
  if (!currentUuid) {
    // No current uuid, return null;
    return null;
  }

  return uuids[currentUuid.group];
};

module.exports = Coordinator;