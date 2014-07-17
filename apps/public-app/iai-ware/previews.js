var exports = module.exports = {}
  , iu = require( 'iai-util').load( 'async utils' )
;

exports.previews = function( app, opts ) {
  opts = opts || {};
  opts.domain = /^previews\./;
  opts.theme = {
    'scripts': [
      '/lib/iai-html5node.js',
      '/lib/iai-previews/main.js'
    ],
    'stylesheets': [ '/lib/iai-previews/main.css' ]
  }

  return function(req, res, next) {
    // add preview toolbar scripts and styles
    res.addTheme( 'preview-toolbar', opts.theme );
    // add client local variables needed by toolbar script
    res.jlocals( 'iai themes available', {} );

    // list all available themes
    app.listThemes(function(theme_list){
      // each one in sequence...
      iu.sequence( theme_list, function(i, theme_id, next){
        // load the theme
        app.getTheme(theme_id, function(theme){
          // store the theme info object
          res.jlocals('iai themes available')[theme_id] = theme;
          // call the next item on the sequence
          next();
          // true = clean cache and get a fresh copy of the theme
        }, true);
        // after sequence is completed call next middleware function
      }, next );
    });
  };
};
