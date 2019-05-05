'user strict';

const http = require('http'),
      url = require('url'),
      fs = require('fs'),
      path = require('path'),
      rpi = require('./rpi'),
      config = require('./config').config;


var imageCache = new Buffer(1);
var piLock = false;

// https://URL:PORT/?u=YWRtaW4=&p=TFNLKigzaG5C

var server = http.createServer(function(req, res){
    req.requrl = url.parse(req.url, true);
    var pathname = req.requrl.pathname;

    // Validate username and password
    var query = req.requrl.query;
    if ((query.u != config.username) || (query.p != config.password)){
	res.writeHead(403, {
	    'Content-Type': 'text/html'
	});
	res.end('403');
	console.log('rejecting bad auth from ' + req.connection.remoteAddress);
	console.log(req.headers);
	return;
    }

    if (pathname == '/pi.jpg'){
        /* Raspistill flags
         *  -vf -hf: flip vertically and horizontally, respectively
         *  -w 640 -h 480: 640x480px image width,height
         *  -rot 90: rotate by 90 degrees
         *  -t 800: take picture after 800ms
         *  -o -: write to stdout
         */
	var args = '-vf -hf -w 640 -h 480 -rot 90 -t 800 -o -';
	res.writeHead(200, {
	    'Content-Type': 'image/png'
	});

	// If camera is already in use, use cached image
	if (piLock){
	    res.write(imageCache);
            res.end();
	}
	else{
            piLock = true;
            rpi.raspistillp(args)
                .then(function(data){
		    imageCache = new Buffer(data.length);
		    data.copy(imageCache);
		    res.write(data);
		    res.end();
                    piLock = false;
                })
                .catch(function(err){
                    res.end();
                });
	}
    }
    else if (pathname == '/'){
	var index = fs.readFileSync(path.join(__dirname, 'index.html'));
        index = index.toString();
        index = index.replace(/{{USERNAME}}/g, config.username);
        index = index.replace(/{{PASSWORD}}/g, config.password);
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write(index);
	res.end();
    }
    else if (pathname == '/stream'){
	var c = fs.readFileSync('stream.html').toString();
        c = c.replace(/{{AUTH_KEY}}/g, config.authkey);
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end(c);
    }

});


const ws = rpi.openSocketStream(server, '/stream', config.authkey);

server.listen(config.port, function(){
    console.log('127.0.0.1:' + config.port + '/?u=' + config.username + '&p=' + config.password);
});
