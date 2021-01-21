import { makeModel } from "@rkta/store";
import {
  CONNECTION_DISCONNECTED,
  CONNECTION_CONNECTING,
  CONNECTION_ERROR,
  CONNECTION_OPEN,
} from "@rkta/connection";

type ConnectionData = { connectionType: string; connectionState: string };

type State = Record<string, ConnectionData>;

const defaultState: State = {};

export const connectionModel = makeModel({
  name: "@connection",
  defaultState,
  events: {
    [`${CONNECTION_OPEN}, ${CONNECTION_CONNECTING}, ${CONNECTION_ERROR}`]: (
      state,
      { connectionId, connectionType, type }
    ) => {
      return {
        ...state,
        [connectionId]: { connectionType, connectionState: type },
      };
    },
    [CONNECTION_DISCONNECTED]: (state, { connectionId }) => {
      const nextState = { ...state };
      delete nextState[connectionId];
      return nextState;
    },
    // [`${CONNECTION_DISCONNECTED}, ${CONNECTION_ERROR}, ${CONNECTION_OPEN}, ${CONNECTION_CONNECTING}`]: (
    //   state,
    //   { type }
    // ) => ({
    //   ...state,
    //   connectionState: type,
    // }),
  },
});
