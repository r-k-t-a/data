import { AnyAction } from "@rkta/store";
import {
  CONNECTION_DISCONNECTED,
  CONNECTION_ERROR,
  CONNECTION_OPEN,
  Meta,
} from "../connection";

export type Unsubscribe = () => void;

export type ConnectionClose = {
  connectionId: string;
  reason: string;
  type: typeof CONNECTION_DISCONNECTED;
};

export type ConnectionError = {
  connectionId: string;
  event: Event;
  type: typeof CONNECTION_ERROR;
};

export type ConnectionOpen = {
  connectionId: string;
  type: typeof CONNECTION_OPEN;
};

type PubSubAction =
  | ConnectionClose
  | ConnectionError
  | ConnectionOpen
  | AnyAction;

type PubSub = {
  dispatch(action: PubSubAction, meta: Meta, ...extra: any[]): void;
  subscribe(subscriber: Subscriber): Unsubscribe;
};

export type Subscriber = (
  action: PubSubAction,
  meta: Meta,
  ...args: any[]
) => void;

type PubSubFactory = () => PubSub;

export const makePubSub: PubSubFactory = () => {
  let subscribers: Subscriber[] = [];
  return {
    dispatch(action: AnyAction, meta: Meta, ...extra: any[]): void {
      subscribers.forEach((subscriber) => subscriber(action, meta, ...extra));
    },
    subscribe(subscriber) {
      subscribers.push(subscriber);
      return () =>
        (subscribers = subscribers.filter(
          (currentSubscriber) => subscriber !== currentSubscriber
        ));
    },
  };
};
