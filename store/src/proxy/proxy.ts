import { AnyAction } from "../action";
import { Model, ModelCallback, ModelCallbacksMap } from "../model";
import { AddModel, StoreState } from "../store";

type ActionProducers<S, A extends ModelCallbacksMap<S>> = {
  [P in keyof A]: (
    ...args: Parameters<A[P]>[1] extends undefined
      ? []
      : [action: Parameters<A[P]>[1], ...extra: any[]]
  ) => void;
};

export type ProxiedModel<S, A extends ModelCallbacksMap<S>> = {
  getState(): S;
  subscribe(callback: () => void): () => void;
} & ActionProducers<S, A>;

export const proxy = <S, A extends ModelCallbacksMap<S>>(
  { actions = {} as A, defaultState, events = {}, name }: Model<S, A>,
  { dispatch, getState, mediator, replaceState, savedState }: AddModel
): ProxiedModel<S, A> => {
  const getModelState = (storeState: StoreState): Readonly<S> =>
    Object.freeze(storeState[name]);
  const setState = (nextState: S): void => {
    replaceState({
      ...getState(),
      [name]: nextState,
    });
  };
  const getLocalType = (topic: string) => `${topic}/${name}`;
  const initType = getLocalType("@init");
  const updateType = getLocalType("@update");

  function runCallback(
    callback: ModelCallback<S>,
    storeState: StoreState,
    type: string,
    ...args: any[]
  ) {
    if (name in storeState || type === initType) {
      const nextState = callback(storeState[name], ...args);
      setState(nextState);
      mediator.publish(updateType);
    }
  }

  const initCallback: ModelCallback<S> = (
    state,
    { initState }: { initState: S }
  ) => initState;

  const defaultEvents = {
    [initType]: initCallback,
  };

  // TODO: clabbacks chaining, 1 event can run a serie of callbacks
  Object.entries({ ...defaultEvents, ...events }).forEach(([key, callback]) => {
    key.split(",").forEach((topic) => {
      const type = topic.trim();
      mediator.subscribe(type, (storeState: StoreState, ...args: any[]) => {
        runCallback(callback, storeState, type, ...args);
      });
    });
  });

  dispatch({
    type: initType,
    initState:
      savedState && name in savedState
        ? getModelState(savedState)
        : defaultState,
  });

  return {
    ...Object.entries(actions).reduce((acc, [topic, callback]) => {
      const type = getLocalType(topic);
      mediator.subscribe(type, (storeState: StoreState, ...args: any[]) => {
        runCallback(callback, storeState, type, ...args);
      });

      return {
        ...acc,
        [topic]: (action: AnyAction, ...extraArgs: any[]) => {
          dispatch({ ...action, type }, ...extraArgs);
        },
      };
    }, {} as ActionProducers<S, A>),
    getState() {
      return getModelState(getState());
    },
    subscribe(callback: () => void) {
      return mediator.subscribe(updateType, () => callback());
    },
  };
};
