import { makeModel } from "@rkta/store";
import {
  CONNECTION_DISCONNECTED,
  CONNECTION_CONNECTING,
  CONNECTION_ERROR,
  CONNECTION_OPEN,
} from "@rkta/connection";

type State = {
  connectedAt: number;
  connectionState:
    | typeof CONNECTION_DISCONNECTED
    | typeof CONNECTION_ERROR
    | typeof CONNECTION_OPEN
    | typeof CONNECTION_CONNECTING;
};

const defaultState: State = {
  connectedAt: 0,
  connectionState: CONNECTION_DISCONNECTED,
};

export const clientModel = makeModel({
  name: "@client",
  defaultState,
  events: {
    [CONNECTION_OPEN]: (state) => {
      return { ...state, connectedAt: Date.now() };
    },
    [`${CONNECTION_DISCONNECTED}, ${CONNECTION_ERROR}, ${CONNECTION_OPEN}, ${CONNECTION_CONNECTING}`]: (
      state,
      { type }
    ) => ({
      ...state,
      connectionState: type,
    }),
  },
});
