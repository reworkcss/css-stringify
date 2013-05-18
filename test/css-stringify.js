
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
      var ret = stringify(parse(css), { compress: compress });
      ret.trim().should.equal(css.trim());
    });
  });
});

describe('stringify(obj, {map: []})', function(){
  it('should generate mappings', function(){
    var ast = { stylesheet: { rules: [
      { selectors: ['.foo'], declarations: [], loc: { line: 2, column: 4 } },
      { selectors: ['.bar'], declarations: [], loc: { line: 4, column: 4 } }
    ]}};
    var map = [];
    stringify(ast, { map: map });
    map.should.eql([
      {
        source: { line: 2, column: 4 },
        generated: { line: 1, column: 1 }
      },
      {
        source: { line: 4, column: 4 },
        generated: { line: 4, column: 1 }
      }
    ]);

    map = [];
    stringify(ast, { map: map, compress: true });
    map.should.eql([
      {
        source: { line: 2, column: 4 },
        generated: { line: 1, column: 1 }
      },
      {
        source: { line: 4, column: 4 },
        generated: { line: 1, column: 7 }
      }
    ]);
  });
});
