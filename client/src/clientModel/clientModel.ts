import { makeModel } from "@rkta/store";
import {
  CONNECTION_STATE,
  CONNECTION_DISCONNECTED,
  CONNECTION_CONNECTING,
  CONNECTION_ERROR,
  CONNECTION_OPEN,
  WEBSOCKET_CLIENT,
} from "@rkta/connection";

type State = {
  isCrosstabLeader: boolean;
  connectionState: CONNECTION_STATE;
};

const defaultState: State = {
  isCrosstabLeader: false,
  connectionState: CONNECTION_DISCONNECTED,
};

type SET_IS_LEADER = { isCrosstabLeader: boolean };
type SET_CONNECTION_STATE = { connectionType: string; type: CONNECTION_STATE };

export const clientModel = makeModel({
  name: "@client",
  defaultState,
  actions: {
    setIsLeader: (state, { isCrosstabLeader }: SET_IS_LEADER) => ({
      ...state,
      isCrosstabLeader,
    }),
  },
  events: {
    [`${CONNECTION_DISCONNECTED}, ${CONNECTION_ERROR}, ${CONNECTION_OPEN}, ${CONNECTION_CONNECTING}`]: (
      state,
      { connectionType, type }: SET_CONNECTION_STATE
    ) => {
      if (connectionType === WEBSOCKET_CLIENT)
        return {
          ...state,
          connectionState: type,
        };
      return state;
    },
  },
});
