import { Model, ModelFactory } from "../model";
import { applyMiddleware, Middleware, StateMap } from "../middleware";
import { makeMediator } from "../mediator";

export type StoreFactory = typeof makeStore;
export type Store = ReturnType<StoreFactory>;

export const makeStore = (
  initialState?: StateMap,
  ...middleware: Middleware[]
) => {
  let state: Record<string, any>;
  let models: Record<string, Model>;
  const mediator = makeMediator();

  function getState(): StateMap {
    return Object.entries(models).reduce(
      (acc, [key, model]) => ({ ...acc, [key]: model.state }),
      {}
    );
  }

  const dispatch = applyMiddleware(
    {
      getState,
      dispatch(action, ...extraArgs) {
        mediator.publish(action.type, action, ...extraArgs);
        return action;
      },
    },
    ...middleware
  );

  function addModel(modelFactory: ModelFactory) {
    function getState<S>(): S {
      return Object.freeze(state[modelFactory.id]);
    }
    function setState<S>(nextState: S) {
      state[modelFactory.id] = nextState;
    }
    const model = mediator.mount(
      modelFactory({
        initialState: initialState?.[modelFactory.id],
        getState,
        setState,
        dispatch,
        mediator,
      })
    );
    models[modelFactory.id] = model;
    return model;
  }

  return { addModel, dispatch };
};
