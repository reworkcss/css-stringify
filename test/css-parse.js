
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
    if (~file.indexOf('css')) return;
    file = path.basename(file, '.json');
    it('should stringify ' + file, function(){
      var css = read(path.join('test', 'cases', file + '.css'), 'utf8');
      var json = read(path.join('test', 'cases', file + '.json'), 'utf8');
      var ret = stringify(parse(css));
      ret.should.equal(css);
    })
  });
})