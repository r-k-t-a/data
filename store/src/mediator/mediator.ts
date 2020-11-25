export type MediatorFactory = typeof makeMediator;
export type Mediator = ReturnType<MediatorFactory>;

type Topics = Record<string, Function[]>;

export const makeMediator = () => {
  const topics: Topics = {};
  function mount<O>(
    obj: O
  ): O & { publish: typeof publish; subscribe: typeof subscribe } {
    return Object.assign(obj, { publish, subscribe });
  }
  function publish(topic: string, ...args: any[]) {
    const subscribers = topics[topic] || [];
    subscribers.forEach((emit) => emit(...args));
  }
  function subscribe(topic: string, callback: Function) {
    if (!topics[topic]) topics[topic] = [];
    topics[topic].push(callback);
    return () => {
      topics[topic] = topics[topic].filter((cb) => cb !== callback);
    };
  }
  return {
    mount,
    publish,
    subscribe,
  };
};
