
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
 * @param {Boolean} [options.sourcemap]  generate source map,
 *                  if set to true this will change return value to
 *                  `{code: '...', map: {...}}`, `node` argument should contain
 *                  position information (e.g.  parsed by css-parse with
 *                  `position` option set to `true`)
 * @param {Boolean} [options.compress] compress output (ignores indent option)
 * @param {String} [options.indent] a string used for indents (defaults to 2 spaces)
 *
 * @return {String}
 * @api public
 */

module.exports = function(node, options){
  options = options || {};

  var compiler = options.compress
    ? new Compressed(options)
    : new Identity(options);

  // source maps
  if (options.sourcemap) {
    var sourcemaps = require('./lib/source-map-support');
    sourcemaps(compiler);

    var code = compiler.compile(node);
    return { code: code, map: compiler.map.toJSON() };
  }

  var code = compiler.compile(node);
  return code;
};

