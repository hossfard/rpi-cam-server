# Synopsis

Minimal RPI cam server using node.js. See the simple [cam view
repo](https://github.com/hossfard/rpi-cam-view) for
streaming/displaying the camera on your device.

# Usage

For websLinux virtual video device node must also be
loaded. Specifically, server runs `ffmpeg` on input node
`/dev/video0`.

For actual streaming, the video stream will be grabbed from
`/dev/videoX`. If the virtual device does not show up, load the
`bcm2835-v4l2` device driver module:

```bash
# modprobe bcm2835-v4l2
```

1. Install single depedency
   ```bash
   npm install
   ```
2. Update `config.js` as necessary
3. Start server on server
   ```bash
   node src/server
   ```
4. Client-side: different options
   - Open `http://HOST:PORT/?u=USERNAME&p=PASSWORD` in browser.
   - Open `http://HOST:PORT/stream?u=USERNAME&p=PASSWORD` in browser.
   - Send `GET` request to
     `http://HOST:PORT/pi.jpg?u=USERNAME&p=PASSWORD` to fetch latest
     image.
   - Open a websocket connection to `ws://HOST:PORT/stream`, and send
     authentication token (fixed string) on connect.

 `USERNAME`, `PASSWORD`, and `PORT` are specified in `config.js`.

# Requirements

In addition to the node module dependencies, following packages are
expected to be installed

- `raspistill` (for images)
- `ffmpeg` (for streaming)
