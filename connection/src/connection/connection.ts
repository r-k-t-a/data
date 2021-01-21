import { Unsubscribe } from "@rkta/patterns";
import { AnyAction } from "@rkta/store";

export const CONNECTION = "@connection";
export const CONNECTION_DISCONNECTED = "@connection/dicsonnected";
export const CONNECTION_CONNECTING = "@connection/conecting";
export const CONNECTION_ERROR = "@connection/error";
export const CONNECTION_MESSAGE = "@connection/message";
export const CONNECTION_OPEN = "@connection/open";

export type CONNECTION_STATE =
  | typeof CONNECTION_DISCONNECTED
  | typeof CONNECTION_ERROR
  | typeof CONNECTION_OPEN
  | typeof CONNECTION_CONNECTING;

type Subscriber = (action: AnyAction, meta: Meta, ...args: any[]) => void;

export const clientSyncOptions = ["client-and-server", "client-only"];

export type ConnectionClose = {
  connectionId: string;
  reason: string;
  type: typeof CONNECTION_DISCONNECTED;
};

export type ConnectionConnecting = {
  connectionId: string;
  connectionType: string;
  type: typeof CONNECTION_CONNECTING;
};

export type ConnectionError = {
  connectionId: string;
  event: Event;
  type: typeof CONNECTION_ERROR;
};

export type ConnectionOpen = {
  connectionId: string;
  connectionType: string;
  type: typeof CONNECTION_OPEN;
};

// TODO: move to @rkta/client
export type Meta = {
  actionId: string;
  sync?: typeof clientSyncOptions[number];
  ts: number;
};

export type Connection = {
  close(): void;
  connectionId: string;
  dispatch(action: AnyAction, meta: Meta): void;
  open(): void;
  subscribe(subscriber: Subscriber): Unsubscribe;
};
