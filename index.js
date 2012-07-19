
module.exports = function(node, options){
  options = options || {};
  return node.stylesheet.rules.map(rule(options)).join('\n\n');
};

function rule(options) {
  if (options.compress) {
    return function(rule) {
      return rule.selector
        + '{'
        + rule.declarations.map(declaration(options)).join(';')
        + '}';
    }
  }

  return function(rule) {
    return rule.selector
      + ' {\n'
      + rule.declarations.map(declaration(options)).join('\n')
      + '\n}';
  }
}

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