var dirname = require( 'path' ).dirname

/**
 * Given an object exported by `file`, load the runtime configuration
 * for itself and descendents.
 *
 * The object exported by `file` is supossed to implement the
 * configurable interface (set, get, enable, disable)
 */

module.exports = iaiConfigure;

function iaiConfigure( file, callback ) {
  callback( null );
}