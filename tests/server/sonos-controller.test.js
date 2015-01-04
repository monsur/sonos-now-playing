var SonosController = require('../../src/server/sonos-controller');

describe('test subscribe', function() {
  it('Throws an error if there is no callback url', function() {
    var s = new SonosController();
    try {
      s.subscribe();
    } catch (e) {
      // expected
      return;
    }
    throw new Error('Expected an error.');
  });
});
