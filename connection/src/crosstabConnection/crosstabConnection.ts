import { nanoid } from "nanoid";

import { Connection, CONNECTION_DISCONNECTED, Meta } from "../connection";
import { ConnectionClose, makePubSub } from "../pubSub";

export type ConnectionFactory = () => Connection;

const chanelId = "@rkta/crosstab";

export const makeCrosstabConnection: ConnectionFactory = () => {
  const pubSub = makePubSub();
  const connectionId = nanoid();

  window.addEventListener("storage", ({ key, newValue }) => {
    if (key === chanelId && newValue) {
      const { action, meta, args } = JSON.parse(newValue);
      pubSub.dispatch(action, meta, ...args);
    }
  });

  const dispatch: Connection["dispatch"] = (action, meta, ...args) => {
    const message = JSON.stringify({ action, meta, args });
    localStorage.setItem(chanelId, JSON.stringify(message));
  };

  return {
    close() {
      const action: ConnectionClose = {
        connectionId,
        type: CONNECTION_DISCONNECTED,
        reason: "Close Window",
      };
      const meta: Meta = { id: nanoid(), sync: "client-only", ts: Date.now() };
      dispatch(action, meta);
    },
    connectionId,
    dispatch,
    subscribe: pubSub.subscribe,
  };
};
