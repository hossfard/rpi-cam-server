# Synopsis

Minimal RPI camera server using node.js. See the simple [cam view
repo](https://github.com/hossfard/rpi-cam-view) for
streaming/displaying the camera on your device.

# Requirements

* Node.js
* npm
* `raspistill` (for images)
* `ffmpeg` (for streaming)

# Usage

For websLinux virtual video device node must also be
loaded. Specifically, server runs `ffmpeg` on input node
`/dev/video0`.

For actual streaming, the video stream will be grabbed from
`/dev/video<X>`. If the virtual device does not show up, load the
`bcm2835-v4l2` device driver module:

```bash
sudo modprobe bcm2835-v4l2
```

1. Install the only depedency (needed if "streaming")
   ```bash
   npm install
   ```
2. Update `config.js` as necessary
3. Start server on server
   ```bash
   node src/server
   ```
4. Then there are different options on the client machine:
   - Open `http://HOST:PORT/?u=USERNAME&p=PASSWORD` in browser.
   - Open `http://HOST:PORT/stream?u=USERNAME&p=PASSWORD` in browser.
   - Send `GET` request to
     `http://HOST:PORT/pi.jpg?u=USERNAME&p=PASSWORD` to fetch latest
     image.
   - Open a websocket connection to `ws://HOST:PORT/stream`, and send
     authentication token (fixed string) on connect.

`USERNAME`, `PASSWORD`, and `PORT` are specified in `config.js`.
