/**
 * The iaiRequire function provides access to iai components
 * through a relative require
 */


var exports = module.exports = iai;

exports.version = '1';
exports.stability = 3;

function iai( name ) {
  return require( require( 'path' ).resolve( __dirname, name ) );
}