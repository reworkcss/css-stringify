
/**
 * Module dependencies.
 */

var Compressed = require('./lib/compress');
var Identity = require('./lib/identity');

/**
 * Stringfy the given AST `node`.
 *
 * @param {Object} node
 * @param {Object} [options]
 * @return {String}
 * @api public
 */

module.exports = function(node, options){
  options = options || {};

  var compiler = options.compress
    ? new Compressed(options)
    : new Identity(options);

  if (options.sourceMap) {
    var addSourceMaps = require('./lib/source-map-support');
    addSourceMaps(compiler);
  }

  var code = compiler.compile(node);
  if (options.sourceMap)
    return {code: code, map: compiler.map.toJSON()}
  else
    return code;
};

