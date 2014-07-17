/**
 *
 */

exports = module.exports = iai;

exports.version = '1';
exports.stability = 1;

var fs = require( 'fs' )
  , path = require( 'path' )
  , join = path.join
  , dirname = path.dirname
  //, resolve = path.resolve
  , project // stores stuff
;

function iai( filename ) {
  /*if ( !arguments.length ) {
    return project;
  }*/
  var api = Object.create( iaiPrototype );
  Object.defineProperty( api, 'dirname', {
    value: dirname( filename )
  });
  // project
  return api;
}

var iaiPrototype = {
  // loads key-value pairs from external modules
  setup: function iaiSetup( exp ) {
    exp = RegExp( exp.replace( '*', '(\..+)?' ) );
    files = fs.readdirSync(this.dirname).filter(function(file) {
      return file.match( exp );
    }).sort().reverse();
    var key, values = require( join( this.dirname, slashpath ) );
      for ( key in values ) {
        app.set( key, values[key] );
      }
    return this;
  },
  // loads middleware from external modules
  uses: function iaiUses( dotpath ) {
    return this;
  },
  // loads routes (http verbs) from external modules
  route: function iaiRoute() {
    return this;
  },
  export: function iaiExport() {
  }
};