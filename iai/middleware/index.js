/*
 * Generic container module index file
 */

module.exports = function container( name ) {
  return require( require( 'path' ).resolve( __dirname, name ) );
};