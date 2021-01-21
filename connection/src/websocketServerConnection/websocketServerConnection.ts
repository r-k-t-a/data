import { nanoid } from "nanoid";
import { makePubSub } from "@rkta/patterns";
import WebSocket from "ws";

import {
  Connection,
  ConnectionClose,
  CONNECTION_DISCONNECTED,
} from "../Connection";

export type WebsocketServerConnection = Omit<Connection, "open">;

type MakeWebsocketServerConnection = (
  ws: WebSocket
) => WebsocketServerConnection;

export const makeWebsocketServerConnection: MakeWebsocketServerConnection = (
  ws
) => {
  const connectionId = nanoid();
  const pubSub = makePubSub();

  ws.onclose = ({ reason }) => {
    const action: ConnectionClose = {
      connectionId,
      type: CONNECTION_DISCONNECTED,
      reason: reason || "Client disconnected",
    };
    pubSub.dispatch(action);
  };

  ws.onerror = () => {
    ws.close();
  };

  ws.onmessage = (event) => {
    const { action, meta } = JSON.parse(event.data as string);
    pubSub.dispatch(action, meta);
  };

  return {
    close() {
      ws.close();
    },
    connectionId,
    dispatch(action, meta, ...args) {
      const message = JSON.stringify({ action, meta, args });
      ws.send(message);
    },
    subscribe: pubSub.subscribe,
  };
};
