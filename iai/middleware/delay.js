/**
 * Intentionally simple function to delay response times
 * introducing a timer on the middleware chain.
 */

exports = module.exports = delay;

exports.version = '1';
exports.stability = 3;

/**
 * @function delay( {Int} time = 1000 )
 *     @param time: the delay time in milliseconds
 *     @returns function
 */

function delay( time ) {
  return function delay( req, res, next ){
    setTimeout( next, time || 1000 );
  }
};