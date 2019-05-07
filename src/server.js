'user strict';

const http = require('http'),
      url = require('url'),
      rpi = require('./rpi'),
      routes = require('./routes'),
      config = require('../config').config;


var server = http.createServer(function(req, res){
    req.requrl = url.parse(req.url, true);
    var pathname = req.requrl.pathname;

    if (pathname in routes){
        return routes[pathname](req, res);
    }
    else{
	res.writeHead(404, {
	    'Content-Type': 'text/html'
	});
	return res.end('Page not found');
    }
});


const ws = rpi.openSocketStream(server, '/stream', config.ws_authkey);

server.listen(config.port, function(){
    console.log('Listening on 127.0.0.1:' + config.port);
});
