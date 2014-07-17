var static = require('node-static')
  , imods = require('./reqres-mods')
  , path = require('path')
;

//
// Create a node-static server instance to serve the './media' folder
//

var media_path = path.join( __dirname, 'media' );

var media = new (static.Server)( media_path );
var data = new (static.Server)( media_path );

module.exports = require('http').createServer(function (request, response) {
  //console.log('\n\nold requested\n', request.url);
    imods(request, response);
    //request.addListener('end', function() {
      // no subdomains (main domain requested)
        if(!request.subdomains.length || request.subdomains[0] == 'www'
        || request.headers.host.match(/^127.0.0.1/)
        || request.subdomains[request.subdomains.length-1] == '192') {
          // non ajax requests
          if(!request.headers['x-requested-with']) {
            media.serve(request, response, function(err){
              if(!err || path.extname(request.url)) return;
              // non-ajax + no extname = index.html
              data.serveFile('index.html', 200, {}, request, response);
            });
          }
          // ajax requests
          else {
//            console.log(request.url, !path.extname(request.url));
            // trucar a url si non hai extname
            if(!path.extname(request.url)) {
/*              var parts = request.url.split('/').slice(1);
              console.log(parts);*/
              request.url = path.join('/json', request.url) + '.json';
            }
            media.serve(request, response);
          }
        }
        // static subdomain, serve media
        else if(request.subdomains[0] == 'static') {
          media.serve(request, response);
        }
        else {
          media.serveFile('/404.html', 404, {}, request, response);
        }
    //});
//}, 100); console.log('done');
});
