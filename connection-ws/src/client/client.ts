import { makeMediator, makeQueue } from "@rkta/patterns";
import { AnyAction } from "@rkta/store";

export const CONNECTION = "@connection";
export const CONNECTION_CLOSE = "@connection/close";
export const CONNECTION_CONNECTING = "@connection/conecting";
export const CONNECTION_ERROR = "@connection/error";
export const CONNECTION_MESSAGE = "@connection/message";
export const CONNECTION_OPEN = "@connection/open";

type ErrorEvent = {
  error?: Error;
} & Event;

type CloseEvent = {
  reason: string;
} & Event;

type Meta = {
  id: string;
  sync: "client-and-server";
  ts: number;
};

type MessageEvent = {
  data: string;
} & Event;

export type ConnectionClose = {
  reason: String;
  type: typeof CONNECTION_CLOSE;
};

export type ConnectionError = {
  error: Error;
  type: typeof CONNECTION_ERROR;
};

export type ConnectionMessage = Message & {
  type: typeof CONNECTION_MESSAGE;
};
export type ConnectionOpen = {
  type: typeof CONNECTION_OPEN;
};

type Message = {
  action: AnyAction;
  meta: Meta;
};

export function makeConnection(
  url: string,
  protocols?: string | string[] | undefined
) {
  let connection: WebSocket | null = null;
  const messageQueue = makeQueue<Message>();
  const mediator = makeMediator();
  function onClose({ reason }: CloseEvent) {
    connection?.removeEventListener("close", onClose);
    connection?.removeEventListener("error", onError);
    connection?.removeEventListener("message", onMessage);
    connection?.removeEventListener("open", onOpen);
    const message: ConnectionClose = { type: CONNECTION_CLOSE, reason };
    mediator.publish(CONNECTION, message);
  }
  function onError(event: ErrorEvent) {
    const message: ConnectionError = {
      error: event.error || new Error("Connection error"),
      type: CONNECTION_ERROR,
    };
    mediator.publish(CONNECTION, message);
    connection?.close();
  }
  function onMessage(event: MessageEvent) {
    const { action, meta } = JSON.parse(event.data);
    const message: ConnectionMessage = {
      type: CONNECTION_MESSAGE,
      action,
      meta,
    };
    mediator.publish(CONNECTION, message);
  }
  function onOpen() {
    const message: ConnectionOpen = { type: CONNECTION_OPEN };
    mediator.publish(CONNECTION, message);
  }
  function connect() {
    mediator.publish(CONNECTION, CONNECTION_CONNECTING);
    connection = new WebSocket(url, protocols);
    connection.addEventListener("close", onClose);
    connection.addEventListener("error", onError);
    connection.addEventListener("message", onMessage);
    connection.addEventListener("open", onOpen);
    messageQueue.items.forEach(send);
  }
  function send(message: Message) {
    messageQueue.add(message);
    if (connection) {
      connection.send(JSON.stringify(message));
      messageQueue.remove(message);
    }
  }
  return {
    connect,
    subscribe(callback: (event: string, message: AnyAction) => void) {
      return mediator.subscribe(CONNECTION, callback);
    },
    publish(action: AnyAction, meta: Meta) {
      const message: Message = { action, meta };
      send(message);
    },
  };
}
