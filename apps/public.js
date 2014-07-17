var express = require( 'express' )
  , app = module.exports = express()
  , modules = require( '../modules' )
  , configure = modules( './configure' )
  , listen = modules( './listen' )
  , poet = require('poet')(app)
;

configure( __filename, bootstrap );

function bootstrap() {

  listen( __filename );
}