
/**
 * Module dependencies.
 */

var stringify = require('..')
  , parse = require('css-parse')
  , fs = require('fs')
  , path = require('path')
  , read = fs.readFileSync
  , readdir = fs.readdirSync;

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
