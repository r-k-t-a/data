import { AnyAction } from "./action";
import { Dispatch } from "./dispatch";
import { makeMediator, Mediator } from "./mediator";
import { applyMiddleware, Middleware } from "./middleware";

// #region Callbacks
export type Callback<S> = (state: S, ...extraArgs: any[]) => S;
export type CallbacksMap<S> = Record<string, Callback<S>>;
// #endregion

// #region Model
type Model<S, A extends CallbacksMap<S>> = {
  actions: A;
  events: CallbacksMap<S>;
  name: string;
  defaultState: S;
};

type ModelProps<S, A extends CallbacksMap<S>> = {
  actions?: A;
  events?: CallbacksMap<S>;
  name: string;
  defaultState: S;
};

type ModelFactory = <S extends any, A extends CallbacksMap<S>>(
  props: ModelProps<S, A>
) => Readonly<Model<S, A>>;

const model: ModelFactory = <S, A extends CallbacksMap<S>>({
  actions = {} as A,
  events = {},
  name,
  defaultState,
}: ModelProps<S, A>): Model<S, A> => ({
  actions,
  events,
  name,
  defaultState,
});
// #endregion

// #region Store
type Store<S> = {
  dispatch: Dispatch;
  getState(): S;
  mediator: Mediator;
  replaceState(state: S): void;
  subscribe(callback: () => void): void;
};
type StoreFactory = <S extends Record<string, any>>(
  savedState: S,
  ...middleware: Middleware[]
) => Store<S>;

const makeStore: StoreFactory = <S>(
  savedState: S,
  ...middleware: Middleware[]
): Store<S> => {
  let state = savedState;

  const change = "store/@change";
  const mediator = makeMediator();
  const dispatch = applyMiddleware(
    {
      getState,
      dispatch(action, ...extraArgs) {
        mediator.publish(action.type, action, ...extraArgs);
        mediator.publish(change, action, ...extraArgs);
        return action;
      },
    },
    ...middleware
  );
  function getState(): S {
    return state;
  }
  function replaceState<N extends S>(nextState: N) {
    state = nextState;
  }
  return {
    dispatch,
    getState,
    mediator,
    replaceState,
    subscribe(callback: () => void) {
      mediator.subscribe(change, callback);
    },
  };
};
// #endregion

// #region Bridge
type ActionProducers<S, A extends CallbacksMap<S>> = {
  [P in keyof A]: (
    ...args: Parameters<A[P]>[1] extends undefined
      ? []
      : [action: Parameters<A[P]>[1], ...extra: any[]]
  ) => void;
};

type ProxiedModel<S, A extends CallbacksMap<S>> = {
  state: S;
  subscribe(callback: (state: S) => void): () => void;
} & ActionProducers<S, A>;

const proxy = <G, S, A extends CallbacksMap<S>>(
  store: Store<G>,
  { actions, defaultState, events, name }: Model<S, A>
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

  function runCallback(callback: Callback<S>, ...args: any[]) {
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

  const actionProducers = Object.entries(actions).reduce(
    (acc, [topic, callback]) => {
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
    },
    {} as ActionProducers<S, A>
  );

  return {
    ...actionProducers,
    state: getState(),
    subscribe(callback: (state: S) => void) {
      return store.mediator.subscribe(updateType, () => callback(getState()));
    },
  };
};
// #endregion

const storeInstance = makeStore({});
const numberModel = model({
  name: "number",
  defaultState: 0,
  actions: {
    add: (state, { value }: { value: number }) => (state += value),
    increment: (state) => ++state,
    decrement: (state) => --state,
  },
});

numberModel;

const numerProxy = proxy(storeInstance, numberModel);
numerProxy.increment();
numerProxy.add({ value: 3 });
