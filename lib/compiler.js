
module.exports = Compiler;

function Compiler(options) {
  this.options = options || {};
}

/**
 * Emit `str`
 */
Compiler.prototype.emit = function(str, pos, startOnly) {
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
