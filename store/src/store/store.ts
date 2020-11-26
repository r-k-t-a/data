import { Dispatch } from "../dispatch";
import { applyMiddleware, Middleware } from "../middleware";
import { makeMediator, Mediator } from "../mediator";

export type StoreState = Record<string, any>;

export type Store = Readonly<{
  dispatch: Dispatch;
  getState(): Readonly<StoreState>;
  mediator: Mediator;
  replaceState(state: StoreState): void;
  subscribe(callback: () => void): () => void;
}>;

type StoreFactory = (
  savedState?: StoreState,
  ...middleware: Middleware[]
) => Store;

export const makeStore: StoreFactory = (savedState, ...middleware) => {
  let state = savedState || {};

  const change = "store/@change";
  const mediator = makeMediator();

  function getState(): Readonly<StoreState> {
    return Object.freeze(state);
  }

  function replaceState(nextState: StoreState) {
    state = nextState;
  }

  const dispatch = applyMiddleware(
    {
      getState,
      dispatch(action, ...extraArgs) {
        mediator.publish(action.type, getState(), action, ...extraArgs);
        mediator.publish(change, action, ...extraArgs);
        return action;
      },
    },
    ...middleware
  );

  const store: Store = {
    dispatch,
    getState,
    mediator,
    replaceState,
    subscribe(callback: () => void) {
      return mediator.subscribe(change, callback);
    },
  };

  return store;
};
