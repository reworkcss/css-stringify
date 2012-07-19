
/**
 * Stringfy the given AST `node`.
 *
 * @param {Object} node
 * @param {Object} options
 * @return {String}
 * @api public
 */

module.exports = function(node, options){
  options = options || {};
  return options.compress
    ? node.stylesheet.rules.map(visit(options)).join('')
    : node.stylesheet.rules.map(visit(options)).join('\n\n');
};

/**
 * Visit rule nodes.
 */

function visit(options) {
  var _rule = rule(options);
  var _keyframes = keyframes(options);
  return function(node){
    if (node.keyframes) return _keyframes(node);
    if (node.import) return atimport(node);
    return _rule(options);
  }
}

/**
 * Compile import.
 */

function atimport(rule) {
  return '@import ' + rule.import + ';';
}

/**
 * Compile keyframes.
 */

function keyframes(options) {
  if (options.compress) {
    return function(keyframes){
      return '@'
      + (keyframes.vendor || '')
      + 'keyframes '
      + keyframes.name
      + '{'
      + keyframes.keyframes.map(keyframe(options)).join('')
      + '}';
    }
  }

  return function(keyframes){
    return '@'
    + (keyframes.vendor || '')
    + 'keyframes '
    + keyframes.name
    + ' {\n'
    + keyframes.keyframes.map(keyframe(options)).join('\n')
    + '}';
  }
}

/**
 * Compile keyframe.
 */

function keyframe(options) {
  if (options.compress) {
    return function(keyframe){
      return keyframe.values.join(',')
        + '{'
        + keyframe.declarations.map(declaration(options)).join(';')
        + '}'
    }
  }

  return function(keyframe){
    return '  '
      + keyframe.values.join(', ')
      + ' {\n'
      + keyframe.declarations.map(indent(declaration(options))).join(';')
      + '\n  }\n'
  }
}

/**
 * Compile rule.
 */

function rule(options) {
  if (options.compress) {
    return function(rule){
      return rule.selector
        + '{'
        + rule.declarations.map(declaration(options)).join(';')
        + '}';
    }
  }

  return function(rule){
    return rule.selector
      + ' {\n'
      + rule.declarations.map(declaration(options)).join('\n')
      + '\n}';
  }
}

/**
 * Compile declarations.
 */

function declaration(options) {
  if (options.compress) {
    return function(decl){
      return decl.property + ':' + decl.value;
    }
  }

  return function(decl){
    return '  ' + decl.property + ': ' + decl.value + ';';
  }
}

/**
 * Indent.
 */

function indent(fn) {
  return function(val){
    return '  ' + fn(val);
  }
}