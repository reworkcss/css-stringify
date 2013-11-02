var SourceMapGenerator = require('source-map').SourceMapGenerator;

/**
 * Expose compiler.
 */

module.exports = Compiler;

/**
 * Initialize a new `Compiler`.
 */

function Compiler(options) {
  options = options || {};
  this.map = new SourceMapGenerator({file: options.filename || 'generated.css'});
  this.position = {line: 1, column: 0};
  this.indentation = options.indent;
}

/**
 * Emit string and update current position
 */

Compiler.prototype.updatePosition = function(str) {
  var lines = str.match(/\n/g);
  if (lines) this.position.line += lines.length;
  var i = str.lastIndexOf('\n');
  this.position.column = ~i ? str.length - i : this.position.column + str.length;
}

Compiler.prototype.emit = function(str, pos, startOnly) {
  if (pos && pos.start) {
    this.map.addMapping({
      generated: {
        line: this.position.line,
        column: Math.max(this.position.column - 1, 0)
      },
      source: 'source.css',
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
 * Compile `node`.
 */

Compiler.prototype.compile = function(node){
  return this.stylesheet(node);
};

/**
 * Visit `node`.
 */

Compiler.prototype.visit = function(node){
  return this[node.type](node);
};

Compiler.prototype.visitMap = function(nodes, join){
  join = join || '';
  var result = '';
  for (var i = 0, length = nodes.length; i < length; i++) {
    result += this.visit(nodes[i]);
    if (i < length - 1) result += this.emit(join);
  }
  return result;
};

/**
 * Visit stylesheet node.
 */

Compiler.prototype.stylesheet = function(node){
  return this.visitMap(node.stylesheet.rules, '\n\n');
};

/**
 * Visit comment node.
 */

Compiler.prototype.comment = function(node){
  return this.emit(this.indent() + '/*' + node.comment + '*/', node.position);
};

/**
 * Visit import node.
 */

Compiler.prototype.import = function(node){
  return this.emit('@import ' + node.import + ';', node.position);
};

/**
 * Visit media node.
 */

Compiler.prototype.media = function(node){
  return this.emit('@media ' + node.media, node.position, true)
    + this.emit(
        ' {\n'
        + this.indent(1))
    + this.visitMap(node.rules, '\n\n')
    + this.emit(
        this.indent(-1)
        + '\n}');
};

/**
 * Visit document node.
 */

Compiler.prototype.document = function(node){
  var doc = '@' + (node.vendor || '') + 'document ' + node.document;

  return this.emit(doc, node.position, true)
    + this.emit(
        ' '
      + ' {\n'
      + this.indent(1))
    + this.visitMap(node.rules, '\n\n')
    + this.emit(
        this.indent(-1)
        + '\n}');
};

/**
 * Visit charset node.
 */

Compiler.prototype.charset = function(node){
  return this.emit('@charset ' + node.charset + ';', node.position);
};

/**
 * Visit namespace node.
 */

Compiler.prototype.namespace = function(node){
  return this.emit('@namespace ' + node.namespace + ';', node.position);
};

/**
 * Visit supports node.
 */

Compiler.prototype.supports = function(node){
  return this.emit('@supports ' + node.supports, node.position, true)
    + this.emit(
      ' {\n'
      + this.indent(1))
    + this.visitMap(node.rules, '\n\n')
    + this.emit(
        this.indent(-1)
        + '\n}');
};

/**
 * Visit keyframes node.
 */

Compiler.prototype.keyframes = function(node){
  return this.emit('@' + (node.vendor || '') + 'keyframes ' + node.name, node.position, true)
    + this.emit(
      ' {\n'
      + this.indent(1))
    + this.visitMap(node.keyframes, '\n')
    + this.emit(
        this.indent(-1)
        + '}');
};

/**
 * Visit keyframe node.
 */

Compiler.prototype.keyframe = function(node){
  var decls = node.declarations;

  return this.emit(this.indent())
    + this.emit(node.values.join(', '), node.position, true)
    + this.emit(
      ' {\n'
      + this.indent(1))
    + this.visitMap(decls, '\n')
    + this.emit(
      this.indent(-1)
      + '\n'
      + this.indent() + '}\n');
};

/**
 * Visit page node.
 */

Compiler.prototype.page = function(node){
  var sel = node.selectors.length
    ? node.selectors.join(', ') + ' '
    : '';

  return this.emit('@page ' + sel, node.position, true)
    + this.emit('{\n')
    + this.emit(this.indent(1))
    + this.visitMap(node.declarations, '\n')
    + this.emit(this.indent(-1))
    + this.emit('\n}');
};

/**
 * Visit rule node.
 */

Compiler.prototype.rule = function(node){
  var indent = this.indent();
  var decls = node.declarations;
  if (!decls.length) return '';

  return this.emit(node.selectors.map(function(s){ return indent + s }).join(',\n'), node.position, true)
    + this.emit(' {\n')
    + this.emit(this.indent(1))
    + this.visitMap(decls, '\n')
    + this.emit(this.indent(-1))
    + this.emit('\n' + this.indent() + '}');
};

/**
 * Visit declaration node.
 */

Compiler.prototype.declaration = function(node){
  return this.emit(this.indent())
    + this.emit(node.property, node.position)
    + this.emit(': ')
    + this.emit(node.value, node.position)
    + this.emit(';');
};

/**
 * Increase, decrease or return current indentation.
 */

Compiler.prototype.indent = function(level) {
  this.level = this.level || 1;

  if (null != level) {
    this.level += level;
    return '';
  }

  return Array(this.level).join(this.indentation || '  ');
};
