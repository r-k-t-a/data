import { applyMiddleware, Middleware } from "../middleware";
import { makeMediator } from "../mediator";
import { CallbacksMap, ModelInstance, EnhacedModelFactory } from "../model";

export type StateMap = Record<string, any>;

export type StoreFactory = typeof makeStore;
export type Store = ReturnType<StoreFactory>;

export const makeStore = (
  initialState?: StateMap,
  ...middleware: Middleware[]
) => {
  let state: Record<string, any>;
  let models: Record<string, ModelInstance<any, any>>;

  const change = "store/@change";
  const mediator = makeMediator();

  function getState(): StateMap {
    return state;
  }

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

  function addModel<S, A extends CallbacksMap<S>>(
    modelFactory: EnhacedModelFactory<S, A>
  ): ModelInstance<S, A> {
    if (modelFactory.id in models) return models[modelFactory.id];
    function getState(): Readonly<S> {
      return Object.freeze(state[modelFactory.id]);
    }
    function setState(nextState: S): void {
      state[modelFactory.id] = nextState;
    }
    const model = modelFactory({
      initialState: initialState?.[modelFactory.id],
      getState,
      setState,
      dispatch,
      mediator,
    });
    models[modelFactory.id] = model;
    return model;
  }

  function subscribe(callback: Function) {
    return mediator.subscribe(change, callback);
  }

  return { addModel, dispatch, getState, subscribe };
};
