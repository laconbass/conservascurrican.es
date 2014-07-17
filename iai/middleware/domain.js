/**
 * Restricts `fn` execution to the cases which req.host
 * matches `domain`. `fn` is expected to be a middleware
 * function.
 */

exports = module.exports = domain;

exports.version = '1';
exports.stability = 1;

function domain( domain, fn ) {
  return function( req, res, next ) {
    // do nothing if host does not match domain
    // call fn elsecase
    if( !~req.host.search( domain ) ) {
      return next();
    }
    fn( req, res, next );
  };
};