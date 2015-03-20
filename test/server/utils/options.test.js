var assert = require('assert');
var Options = require('../../../src/server/utils/options.js');

describe('options', function() {
  it('has no options', function() {
    var opts = new Options();
    var i = 0;
    for (var key in opts.opts) {
      i++;
    }
    assert.equal(i, 0);
  });

  it('has some options', function() {
    var opts = new Options({'a': 1, 'b': 2});
    assert.equal(opts.a, 1);
    assert.equal(opts.b, 2);
  });

  it('has some options with defaults', function() {
    var opts = new Options({'a': 1, 'b': 2}, {'b': 3, 'c': 4});
    assert.equal(opts.a, 1);
    assert.equal(opts.b, 2);
    assert.equal(opts.c, 4);
  });
});
