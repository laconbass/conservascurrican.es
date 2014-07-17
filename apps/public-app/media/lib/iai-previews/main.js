(function(iai, $){
  var menu = ( new iai.Html5Node('div', { '#': 'iai-previews-toolbar' }) )
    , themes = locals['iai themes available']
    , prefix = locals['iai themes prefix']
    , active_themes = locals['active themes']
    , noop = function(){}
    , log = iai.log || console.log
  ;
  for( var id in themes ) {
    menu.push(
      ( new iai.Html5Node('button') )
        .attr( 'id', id )
        .attr( 'class', isActive(id)? 'active' : '' )
        .push( themes[id].name+' v'+themes[id].version )
    );
  }
  // tell whatever a theme is active
  function isActive(theme_id) {
    return !!~active_themes.indexOf(id);
  }
  // helps constructing theme resource's urls
  function urlHelper(theme_id) {
    return function(url) {
      if( !~url.search(/^https?:\/\//) && url[0] != '/' ) {
        url = prefix + theme_id + '/' + url;
      }
      return url;
    };
  }
  // given a theme id, 
  function preview(theme_id, callback) {
    if( !themes[theme_id] ) {
      throw 'theme "'+theme_id+'" does not exist';
    }
    log('previewing theme', theme_id, '...');
    callback = callback || noop;
    // remove any available active themes
    for( var k in active_themes ) {
      if( active_themes[k] in themes ){
        log('deactivate', active_themes[k], 'theme')
        // remove the theme resources from the DOM
        resources( active_themes[k] ).remove();
        // remove the theme id from active_themes
        active_themes.splice(k, 1);
      }
    }
    var styles = themes[theme_id].stylesheets
      , scripts = themes[theme_id].scripts
      , theme_url = urlHelper(theme_id)
      , loading = [] 
      , appendCss = function(url){
          var l = document.createElement('link');
          l.rel = 'stylesheet';
          l.href = theme_url( url );
          l.onload = function(){
            loading.splice( loading.indexOf(url), 1 );
            if( !loading.length ) {
              log( 'all resources loaded' );
              callback();
            } else {
              log(url, 'loaded',
                loading.length, 'resources left', loading);
            }
          };
          loading.push( url );
          log( 'append stylesheet', l );
          document.head.appendChild(l);
        }
      , appendJs = function(url){
          // ensure not to duplicate any script
          /*if( $('script[src="'+theme_url( url )+'"]').length > 0 ){
            return;
          }*/
          var s = document.createElement('script');
          s.src = theme_url( url );
          s.onload = function(){
            loading.splice( loading.indexOf(url), 1 );
            if( !loading.length ) {
              log( 'all resources loaded' );
              callback();
            } else {
              log(url, 'loaded',
                loading.length, 'resources left', loading);
            }
          };
          loading.push( url );
          log( 'append script', s );
          document.body.appendChild(s);
        }
    ;
    // append stylesheets and scripts
    for( var k in styles ) { appendCss( styles[k] ); }
    for( var k in scripts ) { appendJs( scripts[k]); }
    // set theme as active
    active_themes.push( theme_id );
    // ensure callback is executed if there are any resources to load
    if( !scripts.length && !styles.length ) {
      callback();
    }
  }
  // given a theme id, retrieve the DOM elements which are theme resources
  function resources(theme_id) {
    // do nothing with no available themes
    if( !(theme_id in themes) ) {
      return;
    }
    var selector = ''
      , styles = themes[theme_id].stylesheets
      , scripts = themes[theme_id].scripts
      , theme_url = urlHelper(theme_id)
    ;
    for( var i in styles ){
      selector += ( i > 0? ', ' : '' );
      selector += 'link[href="'+theme_url( styles[i] )+'"]';
    }
    for( var i in scripts ){
      selector += ( ( i > 0 || !!i )? ', ' : '' );
      selector += 'script[src="'+theme_url( scripts[i] )+'"]';
    }
    selector = $(selector);
    log( 'sources for', theme_id, Array.prototype.slice.call( selector, 0 ) );
    return selector;
  }
  // iai exposed values
  ///iai.preview = preview;
  // toolbar injection
  $(document).ready(function(){
    // append the toolbar to the document body
    $('body').append( menu.dump() );
    // overwrite menu var with toolbar DOM reference
    menu = $( '#' + menu.attr('id') );
    // bind event listeners
    menu.find('button').click(function(){
      var btn = $(this);
      if( btn.hasClass('active') ) {
        return false;
      }
      var elements = $('body > *').not(menu).hide();
      preview( btn.attr('id'), function(){
        menu.find('button.active').removeClass('active');
        btn.addClass('active');
        // TODO falsa barra de progreso de fondo da toolbar
        setTimeout( function(){
          elements.show();
        }, 500 );
      });
    });
  });
})(iai, jQuery);
