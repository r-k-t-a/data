const WebSocket = require("ws");

const port = 8080;

const ws = new WebSocket.Server({
  port,
  perMessageDeflate: {
    zlibDeflateOptions: {
      // See zlib defaults.
      chunkSize: 1024,
      memLevel: 7,
      level: 3,
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024,
    },
    // Other options settable:
    clientNoContextTakeover: true, // Defaults to negotiated value.
    serverNoContextTakeover: true, // Defaults to negotiated value.
    serverMaxWindowBits: 10, // Defaults to negotiated value.
    // Below options specified as default values.
    concurrencyLimit: 10, // Limits zlib concurrency for perf.
    threshold: 1024, // Size (in bytes) below which messages
    // should not be compressed.
  },
});

ws.on("connection", (connection) => {
  connection.on("message", console.log);

  const action = { type: "hello" };
  const meta = { sync: "client" };
  connection.send(JSON.stringify({ action, meta }));
  // connection.send({ test: "1" });
});

console.log(`ws is listening ${port}`);
