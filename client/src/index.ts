import { Store } from "@rkta/store";
import {
  ConnectionFactory,
  CONNECTION_CONNECTING,
  Meta,
} from "@rkta/connection";
import { nanoid } from "nanoid";

import { clientModel } from "./clientModel";

type ClientFactory = (props: {
  connectToServer: ConnectionFactory;
  makeCrosstabConnection: ConnectionFactory;
  store: Store;
}) => null;

export const makeClient: ClientFactory = ({
  connectToServer,
  makeCrosstabConnection,
  store,
}) => {
  store.addModel(clientModel);
  // const crosstabConnection = makeCrosstabConnection();
  // store.subscribe(serverConnection.dispatch);
  // crosstabConnection.subscribe(console.log);

  function connect() {
    const action = { type: CONNECTION_CONNECTING };
    const meta: Meta = { id: nanoid(), sync: "client-only", ts: Date.now() };
    store.dispatch(action, meta);
    const serverConnection = connectToServer();
    return serverConnection.subscribe(store.dispatch);
  }
  connect();
  store.subscribe((state, action, meta) => {
    console.log("state: ", state, action, meta);
  });
  return null;
};
