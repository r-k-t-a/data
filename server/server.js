const WebSocket = require("ws");
const { makeServerConnection } = require("@rkta/connection");

const port = 8080;

const ws = new WebSocket.Server({ port });

const server = makeServerConnection(ws);

server.subscribe(console.log);

console.log(`ws is listening ${port}`);
