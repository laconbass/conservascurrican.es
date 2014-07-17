/**
 * Sighly modified version of connect's Vhost
 * http://www.senchalabs.org/connect/vhost.html
 */

var util = require( 'util' );

exports = module.exports = vhost;

exports.version = '1';
exports.stability = 2;

function vhost( hostname, server ) {
  if ( !hostname ) throw new Error('vhost hostname required');
  if ( !server ) throw new Error('vhost server required');

  if ( !util.isRegExp( hostname ) )
    hostname = new RegExp('^' + hostname.replace(/[*]/g, '(.*?)') + '$', 'i');

  return function vhost(req, res, next) {
    if ( !req.headers.host ) return next();
    var host = req.headers.host.split(':')[0];
    if ( !hostname.test( host ) ) return next();
    if ( 'function' == typeof server ) return server( req, res, next );
    server.emit( 'request', req, res );
  };
}