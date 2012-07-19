
module.exports = function(node){
  return node.stylesheet.rules.map(rule).join('\n');
};

function rule(rule) {
  return rule.selector
    + ' {\n'
    + rule.declarations.map(declaration).join(';\n')
    + '\n}';
}

function declaration(decl) {
  return decl.property + ': ' + decl.value;
}