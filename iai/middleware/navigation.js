/**
 * Ajax navigation handler
 */

exports = module.exports = navigation;

exports.version = '1';
exports.stability = 1;
exports.dependencies = {
  '/jlocals' : '1'
};

/**
 * @function navigation( {Object} opts )
 */

function navigation( opts ) {

  // TODO opts
  // opts: 'base-fill' 'xhr-fn'
  return function( req, res, next ) {
    res.irender = function(view, locals){
      res.render(view, locals, function(err, html){
        if(err) {
          console.error(err);
          html = '<pre>'+err+'</pre>';
        }
        console.log( res.locals );
        if(req.xhr)
          res.send(200, {
            schema: "iai-nav"
            ,html: html
            ,jlocals: res.locals.jlocals
          });
        else
          res.render('base-fill', { html: html });
      });
    };
    next();
  };
}