// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function noop() {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

/*
 *********************
 iai navigation plugin
 *********************
*/

(function($, w){
    var body = $('body')
      , header = body.find('header')
      , main = body.find('div[role="main"]')
      , sections = $('section')
      , loading = false
      // Log: logs to console if debug is enabled
      , log = function() {
          if(iai && iai.env == 'development')
            { console.log.apply(console, arguments); }
        }
      // Is Loading: Tells wheter the system is loading something.
      , is_loading = function(){
          return loading;
        }
      // Load: Load url throught AJAX.
      , load = function(url, callback) {
            loading = true;
            $.ajax(url)
              .done(function(data){
                loading = false;
                log('loaded',  '\n****');
                callback(data);
              })
              .fail(function(xhr){
                main.html(
                  '<section id="' + (xhr.status==404?
                    'not-found':'server-error') + '">'
                  + xhr.responseText
                  + '</section>'
                );
                sections = $('section');
                select($('section'));
              })
            ;
        }
      // Go To: Search the content, given locator, and display the section containing it.
      //   @param locator: any valid jQuery selector.
      // Note: Character '!' will be replaced with '' on locator.
      //       This character is used as convention on js resource locators
      , go_to = function(locator, callback){
          // do nothing if something is loading
          if(is_loading()) return;

          var locOriginal = locator;
          callback = callback || function(){};
          locator = (locator || '/')
              .replace(/^\//, '')
              .replace(/[^\\/\dA-z_-]+/g, '')
              .split('/')
          ;
          // locator empty?
          if(!locator[0]) { return go_home(callback); }
          log('****\ngo to', locator);

          // section is always the first path chunk
          var section_id = locator.shift()
            , section = content = sections
                .filter('#'+section_id)
            , selections = [section]
          ;

          while(section.length && locator.length) {
            selections.push(
              content = section.find('#'+locator.shift())
            );
          }

          log('content exists?', !!content.length);
          // if no content found on DOM, load through AJAX
          if(!content.length) {
            main.append('<section id="'+section_id+'" class="loading selected"></section>');
            sections = $('section');
            section = sections.filter('#'+section_id);
            select(section);
            load(locOriginal, function(data){
              if(!data.schema || data.schema != 'iai-nav'){
                throw "Expecting an iai-nav response";
              }
              section
                .removeClass('loading')
                .html(data.html)
              ;
              for(var i in data.scripts){
                if( $('script[src="'+data.scripts[i]+'"]').length > 0 ){
                  continue;
                }
                var js = document.createElement('script');
                js.type = "text/javascript";
                js.src = data.scripts[i];
                document.body.appendChild(js);
              }
              go_to(locOriginal);
            })
            return log('loading section...');
          }
          else {
            // notify selection of this section and the content
            select.apply(select, selections);
            // display the content
/*            content.slideDown(function(){
              // scroll to the content
              $(jQuery.browser.webkit? "body":"html")
                .animate({scrollTop: content.offset().top}
                , 'slow', 'swing'
                , function(){
                    log('displayed content', content[0], '\n----');
                    callback();
                  }
              );
            });*/
          }
        }
      // Select: Notify the selected elements, or unselect selected ones.
      //   @params element1...elementN: any DOM element or undefined for unselecting
      , select = function(element1, elementN) {
          // unselect all selected elements except body
          log('****\nunselect all');
          $('.selected')
            .not(body)
            .removeClass('selected')
            .each(function(i, e){ body.removeClass($(e).attr('id')); })
          ;
          // select(void) mode
          if(!arguments.length){
            //notify to body that no content is selected
            body.removeClass('selected');
            return log('select(void) done.\n----');
          }
          // notify to body that some content is selected
          body.addClass('selected');
          // select given elements
          var args = Array.prototype.filter.call(arguments, function(e){ return !!e; });
          $(args).each(function(i, e){
            var id = $(e).attr('id');
            // help debugging
            log( 'select', e[0] );
            if(!id) { log("selected element", e, "doesn't have id"); }
            // notify to body that this is the selected section
            body.addClass(id).trigger('iai-nav-selected');
            // Notify to the element itself
            $(e)
              // and any reference to the element's id
              .add($('[href$='+id+']'))
            // they are selected
              .addClass('selected')
              .trigger('iai-nav-selected')
            ;
          });
          log('done.\n----');
          
        }
      // Go Home: Hide current section, optionally unselect all selected elements.
      , go_home = function(callback, keep_selections){
          callback = callback || function(){};
          keep_selections = keep_selections || false;
          log('****\ngo home, keep_selections?', keep_selections);
          // search the current section
          var current = sections.filter(':visible');
          current.slideUp(function(){
            // unselect all selected elements
            if(!keep_selections) select();
            callback();
          });
          if(!current.length) {
            log('already at home\n----');
            callback();
          }
        }
      , click_listener = function(){
          if($(this).hasClass('selected')) {
            return false;
          }
          log('##click exec##');
          go_to($(this).attr('href'));
          log('##click return##');
        }
    ;
    w.iai = $.extend(w.iai || {}, {
      goHome: go_home
      ,go: go_to
      ,click_listener: click_listener
      ,log: iai.log || log
    });
})(jQuery, window);
