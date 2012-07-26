
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
  return options.compress
    ? node.stylesheet.rules.map(visit(options)).join('')
    : node.stylesheet.rules.map(visit(options)).join('\n\n');
};

/**
 * Initialize a new `Compiler`.
 */

function Compiler(options) {
  options = options || {};
  this.compress = options.compress;
}

/**
 * Compile `node`.
 */

Compiler.prototype.compile = function(node){
  return node.stylesheet.rules.map(this.visit.bind(this))
    .join(this.compress ? '' : '\n\n');
};

/**
 * Visit `node`.
 */

Compiler.prototype.visit = function(node){
  if (node.keyframes) return this.keyframes(node);
  if (node.media) return this.media(node);
  if (node.import) return this.import(node);
  return this.rule(node);
};

/**
 * Visit import node.
 */

Compiler.prototype.import = function(node){
  return '@import ' + node.import + ';';
};

/**
 * Visit media node.
 */

Compiler.prototype.media = function(node){
  var self = this;

  if (this.compress) {
    return '@media '
      + node.media
      + '{'
      + node.rules.map(this.visit.bind(this)).join('')
      + '}';
  }

  return '@media '
    + node.media
    + ' {\n'
    + node.rules.map(function(node){
      return '  ' + self.visit(node);
    }).join('\n\n')
    + '\n}';
};

/**
 * Visit keyframes node.
 */

Compiler.prototype.keyframes = function(node){
  if (this.compress) {
    return '@'
      + (node.vendor || '')
      + 'keyframes '
      + node.name
      + '{'
      + node.keyframes.map(this.keyframe.bind(this)).join('')
      + '}';
  }

  return '@'
    + (node.vendor || '')
    + 'keyframes '
    + node.name
    + ' {\n'
    + node.keyframes.map(this.keyframe.bind(this)).join('\n')
    + '}';
};

/**
 * Visit keyframe node.
 */

Compiler.prototype.keyframe = function(node){
  var self = this;

  if (this.compress) {
    return node.values.join(',')
      + '{'
      + node.declarations.map(this.declaration.bind(this)).join(';')
      + '}'
  }

  return '  '
    + node.values.join(', ')
    + ' {\n'
    + node.declarations.map(function(node){
      return '  ' + self.declaration(node);
    }).join(';\n')
    + '\n  }\n'
};

/**
 * Visit rule node.
 */

Compiler.prototype.rule = function(node){
  if (this.compress) {
    return node.selectors.join(',')
      + '{'
      + node.declarations.map(this.declaration.bind(this)).join(';')
      + '}';
  }

  return node.selectors.join(',\n')
    + ' {\n'
    + node.declarations.map(this.declaration.bind(this)).join(';\n')
    + '\n}';
};

/**
 * Visit declaration node.
 */

Compiler.prototype.declaration = function(node){
  if (this.compress) {
    return node.property + ':' + node.value;
  }

  return '  ' + node.property + ': ' + node.value;
};
