import WS from "ws";
import { AnyAction } from "@rkta/store";
import { nanoid } from "nanoid";

import { makePubSub, Unsubscribe, Subscriber, ConnectionOpen } from "../pubSub";
import { makeConnection, Connection, CONNECTION_OPEN } from "../connection";

import { Meta } from "../connection/connection";

type ClientsMap = Record<string, Connection>;

type makeServerConnection = (server: WS.Server) => ServerConnection;

export type ServerConnection = {
  dispatch(clientId: number, action: AnyAction, meta: Meta): void;
  subscribe(callback: Subscriber): Unsubscribe;
};

export const makeServerConnection: makeServerConnection = (server) => {
  const clients: ClientsMap = {};

  const pubSub = makePubSub();

  // server.addListener("close", handleClose);
  server.on("connection", (client) => {
    const connection = makeConnection((client as unknown) as WebSocket);
    const unsubscribe = connection.subscribe(pubSub.dispatch);
    const { connectionId } = connection;
    clients[connection.connectionId] = connection;
    client.onclose = unsubscribe;

    const action: ConnectionOpen = { type: CONNECTION_OPEN, connectionId };
    const meta: Meta = { id: nanoid(), ts: Date.now() };
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

  return {
    dispatch(clientId, action, meta) {
      clients[clientId].dispatch(action, meta);
    },
    subscribe(subscriber) {
      return pubSub.subscribe(subscriber);
    },
  };
};
