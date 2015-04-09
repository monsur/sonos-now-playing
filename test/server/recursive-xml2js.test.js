var assert = require('assert');
var RecursiveXml2Js = require('../../src/server/recursive-xml2js');

var testParseXml = function(input, expected) {
  var parser = new RecursiveXml2Js();
  parser.parse(input, function(error, result) {
    assert.deepEqual(result, expected);
  });
};

describe('parse recursive xml', function() {


  it('is xml string', function() {
    var parser = new RecursiveXml2Js();
    assert.equal(parser.isXmlString(), false);
    assert.equal(parser.isXmlString(null), false);
    assert.equal(parser.isXmlString(123), false);
    assert.equal(parser.isXmlString(''), false);
    assert.equal(parser.isXmlString('a'), false);
    assert.equal(parser.isXmlString('><'), false);
    assert.equal(parser.isXmlString('<'), true);
  });

  it('empty string', function() {
    testParseXml('', {});
  });

  it('string that is not xml', function() {
    testParseXml('abcde', {});
  });

  it('empty xml node', function() {
    testParseXml('<a></a>', {'a': ''});
  });

  it('empty xml node (shorthand)', function() {
    testParseXml('<a />', {'a': ''});
  });

  it('xml node with value', function() {
    testParseXml('<a>123</a>', {'a': '123'});
  });

  it('xml node with attribute', function() {
    testParseXml('<a attr="foo"></a>', {'a': {'attr': 'foo'}});
  });

  it('xml node with attribute and value', function() {
    testParseXml('<a attr="foo">123</a>', {'a': {'_': 123, 'attr': 'foo'}});
  });

  it('nested xml in attribute', function() {
    testParseXml('<a attr="&lt;b&gt;123&lt;/b&gt;"></a>',
      {"a":{"attr":{"b":"123"}}});
  });

  it('nested xml in value', function() {
    testParseXml('<a>&lt;b&gt;123&lt;/b&gt;</a>',
        {"a":{"b":"123"}});
  });
});
