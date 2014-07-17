module.exports = iaiListen;

/**
 * Given an object exported by `file`, start listening.
 *
 * It's assumed `file` exports a requestable object
 * (listen, settings: { port, hostname })
 */

function iaiListen( file, callback ) {
  var app = require( file )
    , conf = app.settings[ dirname(file) ]
  ;
  app.listen( conf.port, conf.hostname, function(err) {
    if (err) {
      return callback(err);
    }
    console.log( 'listening on http://%s:%d', conf.hostname, conf.port );
    callback(null);
  });
}