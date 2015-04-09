var assert = require('assert');
var RecursiveXml2Js = require('../../src/server/recursive-xml2js');

describe('parse recursive xml', function() {

  var parser = new RecursiveXml2Js();

  it('is xml string', function() {
    assert.equal(parser.isXmlString(), false);
    assert.equal(parser.isXmlString(null), false);
    assert.equal(parser.isXmlString(123), false);
    assert.equal(parser.isXmlString(''), false);
    assert.equal(parser.isXmlString('a'), false);
    assert.equal(parser.isXmlString('><'), false);
    assert.equal(parser.isXmlString('<'), true);
  });

  it('empty string', function() {
    parser.parse('', function(error, result) {
      assert.deepEqual(result, {});
    });
  });

  it('string that is not xml', function() {
    parser.parse('abcde', function(error, result) {
      assert.deepEqual(result, {});
    });
  });

  it('empty xml node', function() {
    parser.parse('<a></a>', function(error, result) {
      assert.deepEqual(result, {'a': ''});
    });
  });

  it('empty xml node (shorthand)', function() {
    parser.parse('<a />', function(error, result) {
      assert.deepEqual(result, {'a': ''});
    });
  });

  it('xml node with value', function() {
    parser.parse('<a>123</a>', function(err, result) {
      assert.deepEqual(result, {'a': '123'});
    });
  });

  it('xml node with attribute', function() {
    parser.parse('<a attr="foo"></a>', function(err, result) {
      assert.deepEqual(result, {'a': {'attr': 'foo'}});
    });
  });

  it('xml node with attribute and value', function() {
    parser.parse('<a attr="foo">123</a>', function(err, result) {
      assert.deepEqual(result, {'a': {'_': 123, 'attr': 'foo'}});
    });
  });

  it('nested xml in attribute', function() {
    parser.parse('<a attr="&lt;b&gt;123&lt;/b&gt;"></a>',
      function(err, result) {
        assert.deepEqual(result, {"a":{"attr":{"b":"123"}}});
      });
  });

  it('nested xml in value', function() {
    parser.parse('<a>&lt;b&gt;123&lt;/b&gt;</a>',
      function(err, result) {
        assert.deepEqual(result, {"a":{"b":"123"}});
      });
  });
});
