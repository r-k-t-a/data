import { Store } from "@rkta/store";
import {
  clientSyncOptions,
  Connection,
  // CONNECTION_CONNECTING,
  // CONNECTION_DISCONNECTED,
  CONNECTION_OPEN,
  // Meta,
  crosstabConnectionType,
  SET_LEADING_CROSSTAB_CONNECTION,
} from "@rkta/connection";

import { clientModel } from "./clientModel";
import { connectionModel } from "./connectionModel";

type ClientFactory = (props: {
  websocketConnection: Connection;
  crosstabConnection: Connection;
  store: Store;
}) => null;

export const makeClient: ClientFactory = ({
  websocketConnection,
  crosstabConnection,
  store,
}) => {
  const client = store.addModel(clientModel);
  store.addModel(connectionModel);
  // console.log("connection: ", connection);
  store.subscribe((state, action, meta) => {
    if (action.type === SET_LEADING_CROSSTAB_CONNECTION) {
      const isCrosstabLeader =
        action.connectionId === crosstabConnection.connectionId;
      client.setIsLeader({
        isCrosstabLeader,
      });
      if (isCrosstabLeader) {
        websocketConnection.open();
      } else {
        // TODO: send oplog
        websocketConnection.close();
      }
    }
    if (
      action.type === CONNECTION_OPEN &&
      action.connectionType === crosstabConnectionType
    ) {
      console.log("CONNECTION_OPEN: ", action.connectionId);
    }
    if (clientSyncOptions.includes(meta?.sync)) {
      crosstabConnection.dispatch(action, meta);
    }
  });
  websocketConnection.subscribe(store.dispatch);
  crosstabConnection.subscribe(store.dispatch);
  crosstabConnection.open();
  // crosstabConnection.subscribe(console.log);

  // function connect() {
  //   websocketConnection.open();
  //   websocketConnection.subscribe(({ type }) => {
  //     if (type === CONNECTION_OPEN) {
  //       websocketConnection.dispatch(
  //         { type: "piu" },
  //         { actionId: "1", ts: Date.now() }
  //       );
  //     }
  //   });
  // }
  return null;
};
