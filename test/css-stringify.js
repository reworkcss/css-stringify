
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
      ret.should.equal(css);
    });
  });

  it('should not stringify empty selectors', function(){
    var node = {
      stylesheet: {
        rules: [{
          selectors: [],
          declarations: [{
            property: 'color',
            value: 'black'
          }]
        }]
      }
    };

    var ret = stringify(node);
    ret.should.equal('');
  });

  it('should not stringify empty declarations', function(){
    var node = {
      stylesheet: {
        rules: [{
          selectors: [
            'one',
            'two',
            'three'
          ],
          declarations: []
        }]
      }
    };

    var ret = stringify(node);
    ret.should.equal('');
  });
});

