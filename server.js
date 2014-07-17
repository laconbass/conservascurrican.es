
var express = require( 'express' )
  , iai = require( './iai' )
 // , vhost = iai( 'middleware/vhost' )
  //, main = express()
  , main = require( './apps/public-app/app.js' )
  //, app_old = require( './apps/old-app/server.js' )
;

//main.use( vhost( /^themes/, app_new ) );
//main.use( vhost( /^media/, app_new ) );
//main.use( express.logger('dev') );
//main.use( vhost( /^(pruebas|static)/, app_new ) );
//main.use( vhost( /.*/, app_new ) );

main.listen( 8080 );

console.log( 'server listening on http://localhost:8080' );
