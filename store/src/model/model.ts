import { Dispatch } from "../dispatch";
import { Mediator } from "../mediator";

// TODO: unload the arguments
// https://github.com/microsoft/TypeScript/issues/41637
// https://jsbin.com/tajofowolu/edit?js,console

export type Model = typeof model;

type Callback<S> = (state: S, ...extraArgs: any[]) => S;

export type CallbacksMap<S> = Record<string, Callback<S>>;

type ActionProducers<S, A extends CallbacksMap<S>> = {
  [P in keyof A]: (
    ...args: Parameters<A[P]>[1] extends undefined
      ? []
      : [action: Parameters<A[P]>[1], ...extra: any[]]
  ) => void;
};

export type ModelInstance<S, A extends CallbacksMap<S>> = {
  state: S;
  subscribe: (callback: (state: S) => void) => void;
} & ActionProducers<S, A>;

interface ModelFactory<S, A extends CallbacksMap<S>> {
  (props: {
    dispatch: Dispatch;
    initialState?: S;
    getState(): S;
    mediator: Mediator;
    setState(nextState: S): void;
  }): ModelInstance<S, A>;
}

export type EnhacedModelFactory<S, A extends CallbacksMap<S>> = ModelFactory<
  S,
  A
> & {
  id: string;
  defaultState: S;
};

export const model = <S, A extends CallbacksMap<S>>({
  id,
  actions,
  defaultState,
  events,
}: {
  id: string;
  defaultState: S;
  actions?: A;
  events?: CallbacksMap<S>;
}): EnhacedModelFactory<S, A> => {
  const factory: ModelFactory<S, A> = ({
    dispatch,
    initialState,
    getState,
    mediator,
    setState,
  }) => {
    const getLocalType = (topic: string) => `${id}/${topic}`;
    const initType = getLocalType("@init");
    const updateType = getLocalType("@update");

    function runCallback(callback: Callback<S>, ...args: any[]) {
      const nextState = callback(getState(), ...args);
      setState(nextState);
      mediator.publish(updateType);
    }

    Object.entries(events || []).forEach(([key, callback]) => {
      key.split(",").forEach((topic) => {
        mediator.subscribe(topic.trim(), (...args: any[]) => {
          runCallback(callback, ...args);
        });
      });
    });

    setState(typeof initialState === "undefined" ? defaultState : initialState);

    mediator.publish(initType, { type: initType });

    return {
      ...Object.entries(actions || {}).reduce((acc, [topic, callback]) => {
        const type = getLocalType(topic);
        mediator.subscribe(type, (...args: any[]) => {
          runCallback(callback, ...args);
        });
        return {
          ...acc,
          [topic]: (action, ...extraArgs) => {
            dispatch({ ...action, type }, ...extraArgs);
          },
        };
      }, {} as ActionProducers<S, A>),
      get state() {
        return getState();
      },
      subscribe(callback: (state: S) => void) {
        return mediator.subscribe(updateType, () => callback(getState()));
      },
    };
  };

  return Object.assign(factory, {
    id,
    defaultState,
  });
};
