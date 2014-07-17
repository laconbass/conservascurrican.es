/**
 * @function jlocals( {String} local_name = 'js_locals' )
 *   @returns function
 *
 * Sets an api like express' res.locals on `res.locals[ local_name ]` also
 * accesible from `res.jlocals`. The api apports `dump` and `dumpJSON` to
 * ease the transmision of the variables to the client.
 */

exports = module.exports = jlocals;

exports.version = '1';
exports.stability = 2;

function jlocals( local_name ) {
  local_name = local_name || 'js_locals';

  return function( req, res, next ) {
    res.jlocals = res.locals[ local_name ] = jlocals( res.locals );
    res.jlocals( 'env', res.app.settings.env );
    next();
  };
}

/**
 * @function _jlocals( {object} bound )
 *     returns a new jlocals api bound to the given object
 *
 * # jlocals API #
 *
 * @function jlocals( {String} var_name, {Mixed} var_value )
 *     Stores var_value on jlocals[var_name]
 *
 * @function jlocals( {Hash} variables )
 *     Stores on jlocals each value in variables, assigned to its key
 *     @returns null
 *
 * @function jlocals( {String} var_name )
 *     @returns reference to jlocals[var_name]
 */

function _jlocals( bound ) {
  function jlocals( a1, a2 ) {
    if( arguments.length == 2 ) {
      return jlocals[ a1 ] = a2;
    }
    if( iu.isLiteral( a1 ) ){
      for( var key in a1 )
        jlocals[ key ] = a1[ key ];
      return;
    }
    return jlocals[ a1 ];
  };
  jlocals.dump = function() {
    var data = {}, key;
    for( key in this ) {
      data[ key ] = this[ key ];
    }
    return data;
  };
  jlocals.dumpJSON = function() {
    return JSON.stringify( this.dump() );
  };
  return jlocals;
}