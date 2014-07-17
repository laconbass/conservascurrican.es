var exports = module.exports = {}
  , p = require( 'path' )
;

/**
 * Theme middleware
 */

exports.themes = function( app, opts ) {
  app.set( 'iai themes', app.get('iai themes') || [] );

  opts = opts || {};
//  opts.mode = opts.mode || 'local';
  if ( !opts.src ) {
    throw Error( "need a source to get themes from" );
  }
  opts.server = opts.server || '/themes/';

  app.listThemes = function( callback ) {
    fs.readdir( opts.src, function(err, files) {
      if( err ) throw err;
      callback( files );
    });
    return app;
  };

  return function( req, res, next ) {
    var theme_id = res.app.get( 'iai active theme' ) || '';
    if ( !theme_id ) {
      console.log( "warn: 'iai active theme' not set" );
      return next();
    }
    // setTheme allows theme selection per request
    res.setTheme = function( id ) {
      //console.log( 'set theme', id );
      // add iai themes local variable both on
      // server locals and client locals
      res.locals.theme = new Theme( p.join( opts.src, id ) );
      // adds a function that helps building theme urls
      // absolute and external urls are not modified
      res.locals.theme.url = function( source ) {
        if ( !!~source.search(/^https?:\/\//)
          || source[0] === '/' ) {
          return source;
        }
        return opts.server + p.join( theme_id, source );
      };
      res.jlocals( 'iai active theme', id );
      res.jlocals( 'iai themes server', opts.server );
    };
    // by default, add the application theme to each request
    res.setTheme( theme_id );
    next();
  };
};

/**
 * @constructor Theme
 */

function Theme( dir, refresh ) {
  if( typeof dir !== 'string' || !dir ) {
    throw "Theme dir must be a non empty string";
  }
  var info_id = require.resolve( p.join( dir, 'info.json' ) );
  if ( refresh === true ) {
    // ensure the theme info is fresh
    delete require.cache[ info_id ];
  }
  data = require( info_id );

  this.dir = p.dirname( info_id );
  this.name = data.name || p.basename( dir );
  this.version = data.version || 1;
  this.scripts = data.scripts || [];
  this.scripts = data.scripts || [];
  this.stylesheets = data.stylesheets || [];
  return data;
}
