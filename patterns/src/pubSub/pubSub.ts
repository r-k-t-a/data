type Unsubscribe = () => void;

type PubSub = {
  dispatch(...args: any[]): void;
  subscribe(subscriber: Subscriber): Unsubscribe;
};

export type Subscriber = (...args: any[]) => void;

type PubSubFactory = () => PubSub;

export const makePubSub: PubSubFactory = () => {
  let subscribers: Subscriber[] = [];
  return {
    dispatch(...args): void {
      subscribers.forEach((subscriber) => subscriber(...args));
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
