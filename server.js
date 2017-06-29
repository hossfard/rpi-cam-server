"user strict";

const http = require('http'),
      url = require('url'),
      fs = require('fs'),
      rpi = require('./rpi');


const USERNAME = Buffer('admin').toString('base64');     // YWRtaW4=
const PASSWORD = Buffer('LSK*(3hnB').toString('base64'); // TFNLKigzaG5C
const PORT = 8080;

var imageCache = new Buffer(1);
var piLock = false;

// https://URL:PORT/?u=YWRtaW4=&p=TFNLKigzaG5C

var server = http.createServer(function(req, res){
    req.requrl = url.parse(req.url, true);
    var path = req.requrl.pathname;

    // Validate username and password
    var query = req.requrl.query;
    if ((query.u != USERNAME) || (query.p != PASSWORD)){
	res.writeHead(403, {
	    'Content-Type': 'text/html'
	});
	res.end();
	console.log('rejecting bad auth from ' + req.connection.remoteAddress);
	console.log(req.headers);
	return;
    }

    if (path == '/pi.jpg'){
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
	    // rpi.raspistill(args, function(data){
	    //     imageCache = new Buffer(data.length);
	    //     data.copy(imageCache);
	    //     res.write(data);
	    //     res.end();
            //     piLock = false;
	    // });
	}
    }
    else if (path == '/'){
	var index = fs.readFileSync('index.html');
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write(index);
	res.end();
    }
    else if (path == '/stream'){
	var c = fs.readFileSync('stream.html');
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end(c);
    }

});


const AUTHKEY = '0YE07uoK27jNBq92tHADQmw/CS0ayGkk5Ocnjq4+gto=';
const ws = rpi.openSocketStream(server, '/stream', AUTHKEY);

server.listen(PORT, function(){
    console.log('127.0.0.1:' + PORT + '/?u=' + USERNAME + '&p=' + PASSWORD);
});
