# Synopsis

Minimal HTTP server for hosting

Username and password are hardcoded in the server file that must be
passed as query strings to the server. For websocket, client is also
expected to pass to authenticate to avoid being disconnected.

The different methods for serving content is provided:

1. Image based approach
   - `http://host:port/`: html page containing updating image
   - `http://host:port/pi.jpg`: latest image
2. Websocket 'streaming' approach
   - `http://host:port/stream` html containing canvas element with video stream
   - `ws://host:port/stream` websocket stream

# Usage

1. Start server on server
   ```bash
   node server
   ```
2. Client-side: different options
   - Open `http://HOST:PORT/?u=USERNAME&p=PASSWORD` in browser
   - Open `http://HOST:PORT/stream?u=USERNAME&p=PASSWORD` in browser
   - Send GET request to `http://HOST:PORT/pi.jpg?u=USERNAME&p=PASSWORD`
   - Open websocket to `ws://HOST:PORT/stream?u=USERNAME&p=PASSWORD`,
     and send authentication token on connect

# Requirements

In addition to the node modules dependencies, following packages are
expected to be installed

- `raspistill` (for images)
- `ffmpeg` (for streaming)

For websLinux virtual video device node must also be
loaded. Specifically, server runs `ffmpeg` on input node
`/dev/video0`.

```bash
modprobe bcm2835-v4l2
```
