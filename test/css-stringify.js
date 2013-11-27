
/**
 * Module dependencies.
 */

var stringify = require('..')
  , parse = require('css-parse')
  , fs = require('fs')
  , path = require('path')
  , read = fs.readFileSync
  , readdir = fs.readdirSync
  , SourceMapConsumer = require('source-map').SourceMapConsumer;

describe('stringify(obj)', function(){
  readdir('test/cases').forEach(function(file){
    var compress = ~file.indexOf('.compressed');
    it('should stringify ' + path.basename(file), function(){
      var expect;
      if (compress) {
        expect = read(path.join('test', 'cases', file), 'utf8');
        file = file.replace('.compressed', '');
      }
      var css = read(path.join('test', 'cases', file), 'utf8');
      var ret = stringify(parse(css), { compress: compress });
      ret.trim().should.equal((expect || css).trim());
    });
  });
});

describe('stringify(obj, {sourcemap: true})', function(){
  var src = read('test/source-map-case.css', 'utf8');
  var stylesheet = parse(src, { source: 'rules.css', position: true });
  function loc(line, column) {
    return { line: line, column: column, source: 'rules.css', name: null }
  };

  var locs = {
    tobiSelector: loc(1, 0),
    tobiNameName: loc(2, 2),
    tobiNameValue: loc(2, 2),
    mediaBlock: loc(11, 0),
    mediaOnly: loc(12, 2),
    comment: loc(17, 0),
  };

  it('should generate source maps alongside when using identity compiler', function(){
    var result = stringify(stylesheet, { sourcemap: true });
    result.should.have.property('code');
    result.should.have.property('map');
    var map = new SourceMapConsumer(result.map);
    map.originalPositionFor({ line: 1, column: 0 }).should.eql(locs.tobiSelector);
    map.originalPositionFor({ line: 2, column: 2 }).should.eql(locs.tobiNameName);
    map.originalPositionFor({ line: 2, column: 8 }).should.eql(locs.tobiNameValue);
    map.originalPositionFor({ line: 11, column: 0 }).should.eql(locs.mediaBlock);
    map.originalPositionFor({ line: 12, column: 2 }).should.eql(locs.mediaOnly);
    map.originalPositionFor({ line: 17, column: 0 }).should.eql(locs.comment);
  });

  it('should generate source maps alongside when using compress compiler', function(){
    var result = stringify(stylesheet, { compress: true, sourcemap: true });
    result.should.have.property('code');
    result.should.have.property('map');
    var map = new SourceMapConsumer(result.map);
    map.originalPositionFor({ line: 1, column: 0 }).should.eql(locs.tobiSelector);
    map.originalPositionFor({ line: 1, column: 5 }).should.eql(locs.tobiNameName);
    map.originalPositionFor({ line: 1, column: 10 }).should.eql(locs.tobiNameValue);
    map.originalPositionFor({ line: 1, column: 50 }).should.eql(locs.mediaBlock);
    map.originalPositionFor({ line: 1, column: 64 }).should.eql(locs.mediaOnly);
  });
});
