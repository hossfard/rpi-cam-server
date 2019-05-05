'use strict';

const spawn = require('child_process').spawn;


/** Call raspistill, and return output
 *
 * @param {String} args space separated arguments to pass to raspistill
 * @param {Function} cb callback called with stdout results (Buffer)
 *     once process completes
 */
exports.raspistill = function(args, cb){
    // flags must be passed as an array to spawn
    if (typeof args == 'string'){
	args = args.split(' ');
    }

    var raspistill = spawn('raspistill', args);
    var ret = [];
    raspistill.stdout.on('data', function(data){
	ret.push(data);
    });

    raspistill.stdout.on('close', function(code){
	cb(new Buffer.concat(ret));
    });

    raspistill.stdout.on('error', function(err){
        throw err;
    });
};


/* Experimental promise */
exports.raspistillp = function(args){
    // flags must be passed as an array to spawn
    if (typeof args == 'string'){
	args = args.split(' ');
    }

    return new Promise(function(resolve, reject){
        var raspistill = spawn('raspistill', args);
        var ret = [];
        raspistill.stdout.on('data', function(data){
	    ret.push(data);
        });

        raspistill.stdout.on('close', function(code){
	    resolve(new Buffer.concat(ret));
        });

        raspistill.stdout.on('error', function(err){
	    reject(err);
        });
    });
};


/** Open a websocket stream at '/path' on http 'server'
 *
 * Clients are expected to send 'authKey' within 1 second of connecting
 * to authenticate, otherwise it is disconnected
 *
 * @param {Http.Server} server http module server object
 * @param {String} path for websocket to listen on
 * @param {String} authKey authentication key clients are expected to
 *        authenticate with
 */
exports.openSocketStream = function(server, path, authKey){
    const WebSocket = require('ws');
    var wss = new WebSocket.Server({server: server, path: path});
    var FFMPEG = '';

    wss.broadcast = function(data){
        wss.clients.forEach(function (client){
            if ( (client.readyState === WebSocket.OPEN) && (client.auth == true) ){
                client.send(data);
            }
        });
    };

    wss.on('connection', function(socket, req){
        // If socekt doens't send authentication key within 1 second, disconnect it
        setTimeout(function(){
            if (!socket.auth){
                console.log('Socket ' + socket.id + ' failed to authenticate. Disconnecting.');
                socket.close();
            }
        }, 1000);

        // Expect an authentication key
        socket.on('message', function(data){
            console.log(data);
            if (data == authKey){
                socket.auth = true;
            }
        });

        if (FFMPEG == ''){
            // FFMPEG = require('child_process').spawn('ffmpeg',[
            //     '-f', 'video4linux2', '-i', '/dev/video0', '-f', 'mjpeg',
            //     '-r', '10', '-s', '160x144', '-g', '0', '-b', '800000',
            //     '-preset', 'ultrafast', 'pipe:1']);

            FFMPEG = spawn('ffmpeg',[
                '-f', 'video4linux2', '-i', '/dev/video0', '-f', 'mjpeg',
                '-r', '10', '-s', '320x288', '-g', '0', '-b', '800000',
                '-preset', 'ultrafast', 'pipe:1']);

            FFMPEG.stdout.on('data', function(data){
                var frame = new Buffer(data).toString('base64');
                wss.broadcast(frame);
            });

            FFMPEG.on('error', function (err) {
                throw err;
            });

            FFMPEG.on('close', function (code) {
                console.log('ffmpeg exited with code ' + code);
            });

            FFMPEG.stderr.on('data', function (data) {
                // console.log('stderr: ' + data);
            });
        }

        socket.on('close', function(){
            console.log('CLOSED');
            if (wss.clients.size == 0){
                FFMPEG.kill();
                FFMPEG = '';
            }
        });
    });

    return wss;
};
