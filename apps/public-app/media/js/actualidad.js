$(document).ready(function(){
  var container = $('#actualidad')
    , link_selector = 'nav.section-menu a'
  ;
  container.find(link_selector)
    .on('iai-nav-selected', function(e){
      var a = $(this)
        , c = 'selected'
      ;
      //if(a.hasClass(c)){ return false; }
      console.log('select category: '+a.attr('id'));
      var articles = container.find('article.'+a.text())
      ;
      console.log(articles);
      container.find('article, '+link_selector).removeClass(c);
      a.add(articles).addClass(c);
  });
});
