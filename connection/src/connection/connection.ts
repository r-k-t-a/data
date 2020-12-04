import { Unsubscribe } from "@rkta/patterns";
import { AnyAction } from "@rkta/store";
import { nanoid } from "nanoid";

import {
  makePubSub,
  Subscriber,
  ConnectionClose,
  ConnectionError,
  ConnectionOpen,
} from "../pubSub";

export const CONNECTION = "@connection";
export const CONNECTION_DISCONNECTED = "@connection/dicsonnected";
export const CONNECTION_CONNECTING = "@connection/conecting";
export const CONNECTION_ERROR = "@connection/error";
export const CONNECTION_MESSAGE = "@connection/message";
export const CONNECTION_OPEN = "@connection/open";

// TODO: move to @rkta/client
export type Meta = {
  id: string;
  sync?: "client-and-server" | "client-only";
  ts: number;
};

export type Connection = {
  close(): void;
  connectionId: string;
  dispatch(action: AnyAction, meta: Meta, ...extra: any[]): void;
  subscribe(subscriber: Subscriber): Unsubscribe;
};

type ConnectionFactory = (ws: WebSocket) => Connection;

export const makeConnection: ConnectionFactory = (ws) => {
  const connectionId = nanoid();

  const pubSub = makePubSub();

  ws.onclose = ({ reason }) => {
    const action: ConnectionClose = {
      connectionId,
      type: CONNECTION_DISCONNECTED,
      reason,
    };
    const meta: Meta = { id: nanoid(), sync: "client-only", ts: Date.now() };
    pubSub.dispatch(action, meta);
  };

  ws.onerror = (event) => {
    const action: ConnectionError = {
      connectionId,
      type: CONNECTION_ERROR,
      event,
    };
    const meta: Meta = { id: nanoid(), sync: "client-only", ts: Date.now() };
    pubSub.dispatch(action, meta);
    ws.close();
  };

  ws.onmessage = (event) => {
    const { action, meta } = JSON.parse(event.data);
    pubSub.dispatch(action, meta);
  };

  ws.onopen = () => {
    const action: ConnectionOpen = {
      connectionId,
      type: CONNECTION_OPEN,
    };
    const meta: Meta = { id: nanoid(), sync: "client-only", ts: Date.now() };
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
