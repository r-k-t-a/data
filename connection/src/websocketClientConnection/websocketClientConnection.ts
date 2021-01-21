import { nanoid } from "nanoid";
import { makePubSub } from "@rkta/patterns";

import {
  Connection,
  ConnectionClose,
  ConnectionConnecting,
  ConnectionError,
  ConnectionOpen,
  CONNECTION_CONNECTING,
  CONNECTION_DISCONNECTED,
  CONNECTION_ERROR,
  CONNECTION_OPEN,
  Meta,
} from "../Connection";

type WebsocketClientConnectionFactory = (
  connectWebsocket: () => WebSocket
) => Connection;

export const WEBSOCKET_CLIENT = "websocket client";

const noConnectionError = new Error("No conection is open");

export const makeWebsocketClientConnection: WebsocketClientConnectionFactory = (
  connectWebsocket
) => {
  let ws: WebSocket | null = null;
  const connectionId = nanoid();
  const pubSub = makePubSub();

  return {
    close() {
      if (!ws) throw noConnectionError;
      ws.close();
      ws = null;
    },
    connectionId,
    dispatch(action, meta, ...args) {
      if (!ws) throw noConnectionError;
      const message = JSON.stringify({ action, meta, args });
      ws.send(message);
    },
    open() {
      const action: ConnectionConnecting = {
        connectionId,
        connectionType: WEBSOCKET_CLIENT,
        type: CONNECTION_CONNECTING,
      };
      const meta: Meta = {
        actionId: nanoid(),
        sync: "client-only",
        ts: Date.now(),
      };
      pubSub.dispatch(action, meta);
      ws = connectWebsocket();
      ws.onclose = ({ reason }) => {
        const action: ConnectionClose = {
          connectionId,
          type: CONNECTION_DISCONNECTED,
          reason,
        };
        const meta: Meta = {
          actionId: nanoid(),
          sync: "client-only",
          ts: Date.now(),
        };
        pubSub.dispatch(action, meta);
      };

      ws.onerror = (event) => {
        const action: ConnectionError = {
          connectionId,
          type: CONNECTION_ERROR,
          event,
        };
        const meta: Meta = {
          actionId: nanoid(),
          sync: "client-only",
          ts: Date.now(),
        };
        pubSub.dispatch(action, meta);
        ws?.close();
      };

      ws.onmessage = (event) => {
        const { action, meta } = JSON.parse(event.data);
        pubSub.dispatch(action, meta);
      };

      ws.onopen = () => {
        const action: ConnectionOpen = {
          connectionId,
          connectionType: WEBSOCKET_CLIENT,
          type: CONNECTION_OPEN,
        };
        const meta: Meta = {
          actionId: nanoid(),
          sync: "client-only",
          ts: Date.now(),
        };
        pubSub.dispatch(action, meta);
      };
    },
    subscribe: pubSub.subscribe,
  };
};
