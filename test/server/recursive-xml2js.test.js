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
});
