import { Dispatch } from "../dispatch";
import { Mediator } from "../mediator";

// TODO: unload the arguments
// https://github.com/microsoft/TypeScript/issues/41637
// https://jsbin.com/tajofowolu/edit?js,console

export type Model = typeof model;

type FactoryProps<S> = {
  dispatch: Dispatch;
  initialState?: S;
  getState(): S;
  mediator: Mediator;
  setState(nextState: S): void;
};

type Instance<S, A extends CallbacksMap<S>> = ActionProducers<S, A> & {
  state: S;
  subscribe(callback: () => void): () => void;
};

interface Factory<S, A extends CallbacksMap<S>> {
  (props: FactoryProps<S>): Instance<S, A>;
}

interface Callback<S> {
  (state: S, ...extraArgs: any[]): S;
}

type CallbacksMap<S> = Record<string, Callback<S>>;

type ActionProducers<S, A extends CallbacksMap<S>> = {
  [P in keyof A]: (
    ...args: Parameters<A[P]>[1] extends undefined
      ? []
      : [action: Parameters<A[P]>[1], ...extra: any[]]
  ) => void;
};

export function model<S, A extends CallbacksMap<S>>({
  id,
  actions,
  defaultState,
  events,
}: {
  id: string;
  defaultState: S;
  actions?: A;
  events?: CallbacksMap<S>;
}) {
  const factory: Factory<S, A> = ({
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
      subscribe(callback: () => void) {
        return mediator.subscribe(updateType, callback);
      },
    };
  };

  const extras = {
    id,
    defaultState,
  };

  return Object.assign(factory, extras);
}
