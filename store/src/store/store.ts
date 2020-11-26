import { Dispatch } from "../dispatch";
import { applyMiddleware, Middleware } from "../middleware";
import { makeMediator, Mediator } from "../mediator";

type AnyState = Record<string, any>;

export type Store = Readonly<{
  dispatch: Dispatch;
  getState(): AnyState;
  mediator: Mediator;
  replaceState(state: AnyState): void;
  subscribe(callback: () => void): () => void;
}>;

type StoreFactory = (
  savedState?: AnyState,
  ...middleware: Middleware[]
) => Store;

export const makeStore: StoreFactory = (savedState, ...middleware) => {
  let state = savedState || {};

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

  function getState(): AnyState {
    return state;
  }

  function replaceState(nextState: AnyState) {
    state = nextState;
  }

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
