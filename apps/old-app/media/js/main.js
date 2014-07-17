(function(w){
  w.iai = $.extend(w.iai||{}, {
    
  });
})(window);

$(document).ready(function(){
/*    $(window).on('hashchange', function(){
       iai.go(window.location.hash);
    });*/
    iai.go(window.location.pathname);
    if(Modernizr.history) {
      $('a').on('click', function(){
        var loc = $(this).attr('href');
        window.history.pushState({location: loc}, '', loc);
        iai.go(loc);
        return false;
      });
      window.onpopstate = function(e){
        if(e.state){ iai.go(e.state.location); }
      };
    }
//$(window).trigger('hashchange');
});
