var SourceMapGenerator = require('source-map').SourceMapGenerator;

module.exports = mixin;

/**
 * Mixin source map support into the `compiler`
 */
function mixin(compiler) {
  compiler.map = new SourceMapGenerator({file: compiler.options.filename || 'generated.css'});
  compiler.position = {line: 1, column: 1};

  for (var k in SourceMapSupport) {
    compiler[k] = SourceMapSupport[k];
  }
}

/**
 * Compiler mixin which adds source map support
 */
var SourceMapSupport = {
  updatePosition: function(str) {
    var lines = str.match(/\n/g);
    if (lines) this.position.line += lines.length;
    var i = str.lastIndexOf('\n');
    this.position.column = ~i ? str.length - i : this.position.column + str.length;
  },

  emit: function(str, pos, startOnly) {
    if (pos && pos.start) {
      this.map.addMapping({
        generated: {
          line: this.position.line,
          column: Math.max(this.position.column - 1, 0)
        },
        source: pos.source || 'source.css',
        original: {
          line: pos.start.line,
          column: pos.start.column - 1
        }
      });
    }

    this.updatePosition(str);

    if (!startOnly && pos && pos.end) {
      this.map.addMapping({
        generated: {
          line: this.position.line,
          column: Math.max(this.position.column - 1, 0)
        },
        source: pos.source || 'source.css',
        original: {
          line: pos.end.line,
          column: pos.end.column - 1
        }
      });
    }

    return str;
  }
};
