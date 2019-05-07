'user strict';

const http = require('http'),
      url = require('url'),
      rpi = require('./rpi'),
      routes = require('./routes'),
      config = require('../config').config;

// https://URL:PORT/?u=YWRtaW4=&p=TFNLKigzaG5C

var server = http.createServer(function(req, res){
    req.requrl = url.parse(req.url, true);
    var pathname = req.requrl.pathname;

    if (pathname in routes){
        routes[pathname](req, res);
    }
    else{
	res.writeHead(404, {
	    'Content-Type': 'text/html'
	});
	res.end('404');
        return;
    }
});


const ws = rpi.openSocketStream(server, '/stream', config.ws_authkey);

server.listen(config.port, function(){
    console.log('127.0.0.1:' + config.port);
});
