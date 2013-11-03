var SourceMapGenerator = require('source-map').SourceMapGenerator;

module.exports = Compiler;

function Compiler(options) {
  options = options || {};
  this.map = new SourceMapGenerator({file: options.filename || 'generated.css'});
  this.position = {line: 1, column: 1};
}

/**
 * Update current position according to `str` being emitted
 */
Compiler.prototype.updatePosition = function(str) {
  var lines = str.match(/\n/g);
  if (lines) this.position.line += lines.length;
  var i = str.lastIndexOf('\n');
  this.position.column = ~i ? str.length - i : this.position.column + str.length;
}

/**
 * Emit `str` and update current position, use original source `pos` to
 * construct source mapping.
 */

Compiler.prototype.emit = function(str, pos, startOnly) {
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
      source: 'source.css',
      original: {
        line: pos.end.line,
        column: pos.end.column - 1
      }
    });
  }

  return str;
}


/**
 * Visit `node`.
 */

Compiler.prototype.visit = function(node){
  return this[node.type](node);
};

/**
 * Map visit over array of `nodes`, optionally using a `delim`
 */
Compiler.prototype.mapVisit = function(nodes, delim){
  delim = delim || '';
  var result = '';
  for (var i = 0, length = nodes.length; i < length; i++) {
    result += this.visit(nodes[i]);
    if (delim && i < length - 1) result += this.emit(delim);
  }
  return result;
};
