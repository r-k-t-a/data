import { makeMediator, Mediator } from "@rkta/patterns";

import { Dispatch } from "../dispatch";
import { applyMiddleware, Middleware } from "../middleware";
import { Model, ModelCallbacksMap } from "../model";
import { proxy, ProxiedModel } from "../proxy";

export type StoreState = Record<string, any>;

export type AddModel = Readonly<{
  dispatch: Dispatch;
  getState(): Readonly<StoreState>;
  mediator: Mediator;
  replaceState(state: StoreState): void;
  savedState?: StoreState;
}>;

export type MakeStore = typeof makeStore;
export type Store = ReturnType<MakeStore>;

export const makeStore = (
  savedState?: StoreState,
  ...middleware: Middleware[]
) => {
  let state = {};
  const models: Record<string, ProxiedModel<any, ModelCallbacksMap<any>>> = {};

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

  function addModel<S, A extends ModelCallbacksMap<S>>(
    model: Model<S, A>
  ): ProxiedModel<S, A> {
    if (!(model.name in models)) {
      models[model.name] = proxy(model, {
        dispatch,
        getState,
        mediator,
        replaceState,
        savedState,
      });
    }

    return models[model.name] as ProxiedModel<S, A>;
  }

  const store = {
    addModel,
    dispatch,
    getState,
    replaceState,
    subscribe(callback: () => void) {
      return mediator.subscribe(change, callback);
    },
  };

  return Object.freeze(store);
};
