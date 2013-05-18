
/**
 * Stringfy the given AST `node`.
 *
 * @param {Object} node
 * @param {Object} options
 * @return {String}
 * @api public
 */

module.exports = function(node, options){
  return new Compiler(options).compile(node);
};

/**
 * Initialize a new `Compiler`.
 */

function Compiler(options) {
  options = options || {};
  this.compress = options.compress;
  this.indentation = options.indent || '  ';
  this.map = options.map;
}

/**
 * Compile `node`.
 */

Compiler.prototype.compile = function(node){
  this.out = '';
  this.line = 1;
  this.column = 1;
  this.level = 1;
  this.each(node.stylesheet.rules, this.visit);
  return this.out;
};

/**
 * Visit `node`.
 */

Compiler.prototype.visit = function(node){
  if (node.comment) this.comment(node);
  else if (node.charset) this.charset(node);
  else if (node.keyframes) this.keyframes(node);
  else if (node.media) this.media(node);
  else if (node.import) this.import(node);
  else this.rule(node);
};

/**
 * Visit comment node.
 */

Compiler.prototype.comment = function(node){
  if (this.compress) return;
  this.writeln('/*' + node.comment + '*/');
  var newlines = node.comment.match(/\n/g);
  if (newlines) this.line += newlines.length;
};

/**
 * Visit import node.
 */

Compiler.prototype.import = function(node){
  this.write('@import ' + node.import + ';');
};

/**
 * Visit media node.
 */

Compiler.prototype.media = function(node){
  this.write('@media ' + node.media);
  this.writeln('{', ' ');
  this.indent(1);
  this.each(node.rules, this.visit);
  this.indent(-1);
  this.writeln('}');
};

/**
 * Visit charset node.
 */

Compiler.prototype.charset = function(node){
  this.writeln('@charset ' + node.charset + ';');
};

/**
 * Visit keyframes node.
 */

Compiler.prototype.keyframes = function(node){
  this.write('@' + (node.vendor || '') + 'keyframes ' + node.name);
  this.writeln('{', ' ');
  this.indent(1);
  this.each(node.keyframes, this.keyframe);
  this.indent(-1);
  this.writeln('}');
};

/**
 * Visit keyframe node.
 */

Compiler.prototype.keyframe = function(node){
  this.write(node.values.join(', '));
  this.writeln('{', ' ');
  this.indent(1);
  this.declarations(node.declarations);
  this.indent(-1);
  this.writeln('}');
};

/**
 * Visit rule node.
 */

Compiler.prototype.rule = function(node){
  if (this.map && node.loc) {
    var indent = (this.level-1) * this.indentation.length;
    this.map.push({
      source: node.loc,
      generated: {
        line: this.line,
        column: this.column + indent
      }
    });
  }
  var last = node.selectors.length-1;
  node.selectors.forEach(function(s, i){
    this.write(s);
    if (i == last) this.writeln('{', ' ');
    else this.writeln(',');
  }, this);
  this.indent(1);
  this.declarations(node.declarations);
  this.indent(-1);
  this.writeln('}');
};

/**
 * Visit declaration node.
 */

Compiler.prototype.declarations = function(nodes){
  var last = nodes.length-1;
  nodes.forEach(function(node, i) {
    this.write(node.property + ':');
    this.write(node.value, ' ');
    if (i != last) this.write(';', false);
    this.writeln();
  }, this);
};

/**
 * Increase, decrease or return current indentation.
 */

Compiler.prototype.indent = function(level) {
  this.level += level;
};

/**
 * Invoke `fn` for each item in `nodes`.
 */

Compiler.prototype.each = function(nodes, fn){
  var last = nodes.length-1;
  nodes.forEach(function(node, i) {
    fn.call(this, node);
    if (i !== last) this.writeln();
  }, this);
};

/**
 * Append the given `str`.
 * If `indent` is omitted the default indentation is applied.
 * If `indent` is falsy `str` is append without indentation.
 * In compression mode all indetation is ignored.
 */

Compiler.prototype.write = function(str, indent){
  if (!this.compress) {
    if (indent === undefined) {
      indent = Array(this.level).join(this.indentation);
    }
    if (indent) {
      this.out += indent;
      this.column += indent.length;
    }
  }
  this.out += str;
  this.column += str.length;
};

/**
 * Append the given `str` followed by a line break.
 * This increases the internal line counter by one unless compression is turned
 * on, in which case no line breaks are added.
 */

Compiler.prototype.writeln = function(str, indent){
  if (arguments.length) this.write(str, indent);
  if (!this.compress) {
    this.out += '\n';
    this.line++;
    this.column = 1;
  }
};

