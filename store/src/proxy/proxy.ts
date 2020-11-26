import { AnyAction } from "../action";
import { Model, ModelCallback, ModelCallbacksMap } from "../model";
import { Store } from "../store";

type ActionProducers<S, A extends ModelCallbacksMap<S>> = {
  [P in keyof A]: (
    ...args: Parameters<A[P]>[1] extends undefined
      ? []
      : [action: Parameters<A[P]>[1], ...extra: any[]]
  ) => void;
};

export type ProxiedModel<S, A extends ModelCallbacksMap<S>> = {
  getState(): S;
  subscribe(callback: (state: S) => void): () => void;
} & ActionProducers<S, A>;

export const proxy = <S, A extends ModelCallbacksMap<S>>(
  store: Store,
  { actions = {} as A, defaultState, events = {}, name }: Model<S, A>
): ProxiedModel<S, A> => {
  const getState = (): S => store.getState()[name];
  const setState = (nextState: S): void => {
    store.replaceState({
      ...store.getState(),
      [name]: nextState,
    });
  };
  const getLocalType = (topic: string) => `${name}/${topic}`;
  const initType = getLocalType("@init");
  const updateType = getLocalType("@update");

  function runCallback(callback: ModelCallback<S>, ...args: any[]) {
    const nextState = callback(getState(), ...args);
    setState(nextState);
    store.mediator.publish(updateType);
  }

  if (typeof getState() === "undefined") setState(defaultState);

  store.dispatch({ type: initType });

  Object.entries(events).forEach(([key, callback]) => {
    key.split(",").forEach((topic) => {
      store.mediator.subscribe(topic.trim(), (...args: any[]) => {
        runCallback(callback, ...args);
      });
    });
  });

  return {
    ...Object.entries(actions).reduce((acc, [topic, callback]) => {
      const type = getLocalType(topic);
      store.mediator.subscribe(type, (...args: any[]) => {
        runCallback(callback, ...args);
      });
      return {
        ...acc,
        [topic]: (action: AnyAction, ...extraArgs: any[]) => {
          store.dispatch({ ...action, type }, ...extraArgs);
        },
      };
    }, {} as ActionProducers<S, A>),
    getState,
    subscribe(callback: (state: S) => void) {
      return store.mediator.subscribe(updateType, () => callback(getState()));
    },
  };
};
