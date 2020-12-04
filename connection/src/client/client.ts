import { makeConnection, Connection } from "../connection";

type MakeClientConnection = (
  connectWebsocket: () => WebSocket
) => () => Connection;

export const makeClientConnection: MakeClientConnection = (
  connectWebsocket
) => (): Connection => {
  const ws = connectWebsocket();
  return makeConnection(ws);
};
