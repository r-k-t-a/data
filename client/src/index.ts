import { Store } from "@rkta/store";
import { ConnectionFactory } from "@rkta/connection";

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
  // const crosstabConnection = makeCrosstabConnection();
  const serverConnection = connectToServer();
  serverConnection.subscribe(store.dispatch);
  // store.subscribe(serverConnection.dispatch);
  // crosstabConnection.subscribe(console.log);
  store.subscribe((state, action, meta) => {
    console.log("state: ", state, action, meta);
  });
  store.addModel(clientModel);
  return null;
};
