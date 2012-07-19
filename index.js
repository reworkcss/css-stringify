
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
    ? node.stylesheet.rules.map(rule(options)).join('')
    : node.stylesheet.rules.map(rule(options)).join('\n\n');
};

/**
 * Compile import.
 */

function atimport(rule) {
  return '@import ' + rule.import + ';';
}

/**
 * Compile rule.
 */

function rule(options) {
  if (options.compress) {
    return function(rule) {
      if (rule.import) return atimport(rule);

      return rule.selector
        + '{'
        + rule.declarations.map(declaration(options)).join(';')
        + '}';
    }
  }

  return function(rule) {
    if (rule.import) return atimport(rule);

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