import { nanoid } from "nanoid";
import { makePubSub } from "@rkta/patterns";

import {
  Connection,
  ConnectionClose,
  ConnectionConnecting,
  ConnectionOpen,
  CONNECTION_DISCONNECTED,
  CONNECTION_OPEN,
  CONNECTION_CONNECTING,
  Meta,
} from "../Connection";

type Options = {
  ls?: Storage;
};

export type CrossstabConnectionFactory = (options?: Options) => Connection;

export const SET_LEADING_CROSSTAB_CONNECTION =
  "@client/setLeadingCrosstabConnectionId";

export type SetLeadingCrosstabConnectionId = {
  type: typeof SET_LEADING_CROSSTAB_CONNECTION;
  connectionId: string;
};

const chanelId = "@rkta/crosstab";
const candidateKey = "@rkta/crosstab/candidate";

export const crosstabConnectionType = "crosstab";

const IS_THERE_A_LEADER = "IS_THERE_A_LEADER";
const LEADER_EXISTS = "LEADER_EXISTS";

export const makeCrosstabConnection: CrossstabConnectionFactory = (options) => {
  const { ls = localStorage } = options || {};
  const pubSub = makePubSub();
  const connectionId = nanoid();

  let isLeader = true;

  window.addEventListener("storage", ({ key, newValue }) => {
    if (key === chanelId && newValue) {
      const command = JSON.parse(newValue);

      switch (command) {
        case IS_THERE_A_LEADER: {
          if (isLeader) lsSend(LEADER_EXISTS);
          break;
        }
        case LEADER_EXISTS: {
          isLeader = false;
          break;
        }

        default:
          const { action, meta } = command;
          pubSub.dispatch(action, meta);
      }
      // if (
      //   action.type === CONNECTION_OPEN &&
      //   action.connectionType === connectionType
      // ) {
      // }
      // ls.removeItem(chanelId);
    }
  });

  function lsSend(message: any) {
    const json = JSON.stringify(message);
    ls.setItem(chanelId, json);
  }

  const dispatch: Connection["dispatch"] = (action, meta) => {
    lsSend({ action, meta });
  };

  function emitConnecting() {
    const action: ConnectionConnecting = {
      connectionId,
      connectionType: crosstabConnectionType,
      type: CONNECTION_CONNECTING,
    };
    const meta: Meta = {
      actionId: nanoid(),
      sync: "client-only",
      ts: Date.now(),
    };
    pubSub.dispatch(action, meta);
  }
  function emitConnected() {
    const action: ConnectionOpen = {
      connectionId,
      connectionType: crosstabConnectionType,
      type: CONNECTION_OPEN,
    };
    const meta: Meta = {
      actionId: nanoid(),
      sync: "client-only",
      ts: Date.now(),
    };
    pubSub.dispatch(action, meta);
  }

  function promptPingBack() {
    lsSend(IS_THERE_A_LEADER);
  }

  function declareLeadership() {
    if (isLeader) {
      ls.removeItem(candidateKey);
      lsSend(connectionId);
      const action: SetLeadingCrosstabConnectionId = {
        connectionId,
        type: SET_LEADING_CROSSTAB_CONNECTION,
      };
      const meta: Meta = {
        actionId: nanoid(),
        sync: "client-only",
        ts: Date.now(),
      };
      pubSub.dispatch(action, meta);
    }
  }

  function open() {
    emitConnecting();
    promptPingBack();

    setTimeout(() => {
      emitConnected();
      declareLeadership();
    }, 64);

    // const leader = ls.getItem(leaderKey);
    // console.log("leader: ", leader);
    // if (!leader) lead();
  }

  function close() {
    const action: ConnectionClose = {
      connectionId,
      type: CONNECTION_DISCONNECTED,
      reason: "Close Window",
    };
    const meta: Meta = {
      actionId: nanoid(),
      sync: "client-only",
      ts: Date.now(),
    };
    dispatch(action, meta);
  }

  window.onbeforeunload = close;

  return {
    close,
    connectionId,
    dispatch,
    subscribe: pubSub.subscribe,
    open,
  };
};
