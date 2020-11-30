type Topics = Record<string, Function[]>;

export type Unsubscribe = () => void;

export type Mediator = {
  publish(topic: string, ...args: any[]): void;
  subscribe(topic: string, callback: Function): Unsubscribe;
};
export type MediatorFactory = () => Mediator;

export const makeMediator: MediatorFactory = () => {
  const topics: Topics = {};
  return {
    publish(topic, ...args) {
      const subscribers = topics[topic] || [];
      subscribers.forEach((emit) => emit(...args));
    },
    subscribe(topic, callback) {
      if (!topics[topic]) topics[topic] = [];
      if (topics[topic].includes(callback)) throw new Error("Err");
      topics[topic].push(callback);
      return () => {
        topics[topic] = topics[topic].filter((cb) => cb !== callback);
      };
    },
  };
};
