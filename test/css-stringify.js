
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
    var compress = ~file.indexOf('compress');
    file = path.basename(file, '.css');
    it('should stringify ' + file, function(){
      var css = read(path.join('test', 'cases', file + '.css'), 'utf8');
      if (compress) file = file.replace('.compress', '');
      var ast = parse(css, { loc: true });
      var map = [];
      var ret = stringify(ast, { compress: compress, map: map });
      ret.trim().should.equal(css.trim());
      map.forEach(function(m) {
        m.generated.should.eql(m.original);
      });
    });
  });
});
