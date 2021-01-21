import WS from "ws";
import { AnyAction } from "@rkta/store";
import { nanoid } from "nanoid";
import { makePubSub, Unsubscribe, Subscriber } from "@rkta/patterns";

import {
  CONNECTION_DISCONNECTED,
  CONNECTION_OPEN,
  ConnectionOpen,
  Meta,
} from "../Connection";

import {
  makeWebsocketServerConnection,
  WebsocketServerConnection,
} from "../websocketServerConnection";

type ClientsMap = Record<string, WebsocketServerConnection>;

type makeServerConnection = (server: WS.Server) => ServerConnection;

export type ServerConnection = {
  dispatch(clientId: number, action: AnyAction, meta: Meta): void;
  subscribe(callback: Subscriber): Unsubscribe;
};

const connectionType = "websocketServer";

export const makeServerConnection: makeServerConnection = (server) => {
  let clients: ClientsMap = {};

  const pubSub = makePubSub();

  // server.addListener("close", handleClose);
  server.on("connection", (client, req) => {
    const connection = makeWebsocketServerConnection(client);
    const { connectionId } = connection;
    clients[connectionId] = connection;
    const unsubscribe = connection.subscribe((action, meta, ...args) => {
      if (action.type === CONNECTION_DISCONNECTED) {
        delete clients[connectionId];
        unsubscribe();
      }
      pubSub.dispatch(action, meta, ...args);
    });
    console.log("clients: ", Object.keys(clients));

    const action: ConnectionOpen = {
      connectionId,
      connectionType,
      type: CONNECTION_OPEN,
    };
    const meta: Meta = { actionId: nanoid(), ts: Date.now() };
    pubSub.dispatch(action, meta);
  });
  // server.addListener('error')
  // server.addListener('headers')
  // server.addListener('listening')

  // server.on("connection", (client) => {

  //   const action = { type: "hello" };
  //   const meta = { sync: "client" };
  //   client.send(JSON.stringify({ action, meta }));
  // });

  // server.on("close", () => {
  //   mediator.dispatch(CONNECTION_CLOSE);
  // });

  process.on("beforeExit", server.close);

  return {
    dispatch(clientId, action, meta) {
      clients[clientId].dispatch(action, meta);
    },
    subscribe(subscriber) {
      return pubSub.subscribe(subscriber);
    },
  };
};

// // Вызвали подписку
// addSubscription({
//   channel: 'user/1',
//   type: 'userData',
//   id: 1,
// });

// // Подписка продиспатчила экшн
// let dispatch = {
//   type: '@client/subscription',
//   channel: 'user/1',
//   action: {
//     type: 'userData',
//     id: 1,
//   },
//   meta: {
//     actionId: 12,
//     ts: 123,
//     sync: 'client-and-server',
//     status: 'pending',
//   },
// };

// // Клиент отправил сообщение и пропатчил мета
// patchMeta(actionId, { status: 'sent' });

// // если сервер сломался
// patchMeta(actionId, { status: 'pending' });

// // при переподключении отправляем все pending
