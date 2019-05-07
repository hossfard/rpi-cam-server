'use strict';

const fs = require('fs'),
      path = require('path'),
      rpi = require('./rpi'),
      config = require('../config').config;

/** Authenticate request
 *
 * Check if request is authenticated. If authentication is invalid,
 * sends 403 response
 *
 * @param req {Http.Request} HTTP Request object
 * @param res {Http.Response} HTTP Response object
 * @return {bool} true if authenticated, false otherwise
 */
function authenticate(req, res){
    var query = req.requrl.query;
    if ((query.u !== config.username) || (query.p !== config.password)){
	res.writeHead(403, {
	    'Content-Type': 'text/html'
	});
	res.end('Authentication required');
        return false;
    }
    return true;
}

var routes = {};
var IMAGE_CACHE = new Buffer(1);
var PI_LOCK = false;


/** Capture or get latest camera image
 *
 * Capture or get latest camera image. Must authenticate by sending
 * username and password as query paramters in each call.
 *
 * @example {bash} Get latest image
 *   curl -i -X GET http://localhost/pi.jpg?u=<username>&p=<password>
 *
 * @param req {Http.Request} request object
 * @param res {Http.Response} response object
 * @return {Undefined} None
 */
routes['/pi.jpg'] = function(req, res){
    if (!authenticate(req, res)){
        return;
    }

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
    if (PI_LOCK){
	res.write(IMAGE_CACHE);
        res.end();
    }
    else{
        PI_LOCK = true;
        rpi.raspistillp(args)
            .then(function(data){
		IMAGE_CACHE = new Buffer(data.length);
		data.copy(IMAGE_CACHE);
		res.write(data);
		res.end();
                PI_LOCK = false;
            })
            .catch(function(err){
                res.end();
            });
    }
};


/** Index page showing RPI image
 *
 * Must authenticate by sending username and password along query
 * parameters
 *
 * @param req {Http.Request} request object
 * @param res {Http.Response} response object
 * @return {Undefined} None
 */
routes['/'] = function(req, res){
    if (!authenticate(req, res)){
        return;
    }

    var index = fs.readFileSync(path.join(__dirname, 'index.html'));
    index = index.toString();
    index = index.replace(/{{USERNAME}}/g, config.username);
    index = index.replace(/{{PASSWORD}}/g, config.password);
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(index);
    res.end();
};


/** HTML page with an embedded stream
 *
 * Must authenticate by sending username and password along query
 * parameters
 *
 * @param req {Http.Request} request object
 * @param res {Http.Response} response object
 * @return {Undefined} None
 */
routes['/stream'] = function(req, res){
    if (!authenticate(req, res)){
        return;
    }
    var c = fs.readFileSync('stream.html').toString();
    c = c.replace(/{{AUTH_KEY}}/g, config.authkey);
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(c);
};


module.exports = routes;
