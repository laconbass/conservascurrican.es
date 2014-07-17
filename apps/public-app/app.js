var express = require('express')
  , app = express()
  , menu = require('../../data/menu')
  , poet = require('poet')(app)
  // iai themes stuff
  , fs = require('fs')
  , join = require('path').join
  , noop = function(){}
  , iu = require('iai-util')
      .load('async utils')
  , inspect = require('util').inspect;
;

//
// SETUP
//

// all environments
app.configure(function(){
  app.set('title', 'Curricán conservas tradicionales');

  app.set('views', join( __dirname, 'templates') );
  app.set('view engine', 'jade');

  poet.set({
    posts: join( __dirname, '../../data/noticias/' )
  });

  app.set( 'iai active theme', 'newlook2' );
});

// development only
app.configure('development', function(){
  app.set('title', 'Curricán.es - versión en desarrollo');
});

//
// MIDDLEWARE
//

app.use( express.favicon( join( __dirname, 'media/favicon.ico' ) ) );
app.use( require('less-middleware')({
  src: join( __dirname, 'media' ),
  paths: [ join( __dirname, 'media/lib/iai-less' ) ],
  debug: app.settings.env == 'debug'? true : false,
  compress: app.settings.env == 'production'? true : 'auto'
}) );
app.use( express.static( join( __dirname, 'media' ) ) );
app.use( express.logger('dev') );

//app.use( require( './iai-ware/utils' ).delay() );
app.use( require( './iai-ware/navigation' ).nav() );
app.use( require( './iai-ware/utils' ).jlocals() );
app.use( require( './iai-ware/themes' ).themes( app, {
  src: join( __dirname, 'media/themes' )
}) );
//app.use( require( './iai-ware/previews' ).previews( app ) );

//
// ROUTING
//

app.configure('development', function(){
  app.get('/iai-admin', function(req, res){
    res.render('iai-admin');
  });
});

// default locals for all views
app.locals({
  menu: menu
  ,section_name: false
  ,subsection: false
  ,content_id: false
  ,markdown: require('marked')
  ,js_includes: []
});

// HOME view
app.get('/', function(req, res){
  res.render('base.jade');
});

// Main sections

app.param('section', function(req, res, next, name){
  if(!menu[name]) {
    res.status(404);
    name = '404';
    res.locals({
      section_name: 'not-found'
      ,url: req.url
    });
  }
  else {
    res.locals({
      section_name: name
      ,section_url: '/' + name
      ,section_data: menu[name].data || {}
      ,section_js: menu[ name ].scripts || []
    });
  }
  res.section = name;
  next();
});

app.get('/:section', function(req, res){
  res.irender(res.section);
//  console.log(app.locals);
});

// Poet blog
poet.init(function(locals){
  locals.categoryList.unshift('Todas');
  // date format function
  var meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
               'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  locals.postList.forEach(function (post){
    post.date.get_prn = function(){
      return this.getDate()+" de " +meses[this.getMonth()]+" de "+this.getFullYear();
    };
  });
});

app.get('/:section/:content', function(req, res){
  res.irender(res.section, {
    content_id: req.params.content
  });
});
app.get('/:section/:subsection/:content', function(req, res){
  res.irender(res.section, {
    subsection: req.params.subsection
    ,content_id: req.params.content
  });

});


// 404 handler
app.all('*', function(req, res){
  res.status(404).irender('404', {'url': req.url});
});

//
// ERROR HANDLERS
//
app.use(function(err, req, res, next){
  // log error
  console.error(err.stack);
  // warn client
  var text = 'A ocurrido un error grave. Por favor, contacte con el administrador del sistema.';
/*  if(req.xhr)
    res.send(500, { error: text });
  else*/
  res.locals.section_name = 'server-error';
  res.status(500).irender('5xx', {error: text});
});

module.exports = app;
