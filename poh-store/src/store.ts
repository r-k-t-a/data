import { AnyAction } from "./action";
import { Dispatch } from "./dispatch";

export type StoreFactory = typeof makeStore;
export type Store = ReturnType<StoreFactory>;

export type AnyState = any;

export const makeStore = <S>(name: string, defaultState: S) => {
  type Observer = (state: S, action: AnyAction, ...extraArgs: any[]) => void;
  type HandlersMap = {
    [extraProps: string]: Function;
  };

  let observers: Observer[] = [];
  let state: S;

  function setState(nextState: S) {
    state = Object.freeze(nextState);
  }

  let actionHandlers: HandlersMap = {
    "@init": ({ savedState }: AnyAction) => {
      if (typeof savedState !== "undefined") setState(savedState);
      return state;
    },
  };

  setState(defaultState);

  let dispatch: Dispatch = (action, ...extraArgs) => {
    const actionHandler = actionHandlers[action.type];
    if (actionHandler) {
      const nextState = actionHandler(action);
      setState(nextState);
      observers.forEach((observer) => observer(state, action, ...extraArgs));
    }
    return action;
  };

  return {
    get dispatch() {
      return dispatch;
    },
    set dispatch(nextDispatch: Dispatch) {
      dispatch = nextDispatch;
    },
    get name() {
      return name;
    },
    get state() {
      return state;
    },
    set state(nextState: S) {
      setState(nextState);
    },
    observe(observer: Observer) {
      observers.push(observer);
      return () => {
        observers = observers.filter(
          (currentObserver) => currentObserver !== observer
        );
      };
    },
    on<A extends AnyAction>(
      type: A["type"] | A["type"][],
      actionHandler: (action: A) => S
    ) {
      const types = Array.isArray(type) ? type : [type];
      types.forEach((currentType) => {
        actionHandlers[currentType] = actionHandler;
      });
      // TODO: should be required if A has other keys than 'type'
      // https://stackoverflow.com/questions/52318011/optional-parameters-based-on-conditional-types
      return (action?: Omit<A, "type">, ...extraArgs: any[]) => () =>
        dispatch({ type: types[0], ...action }, ...extraArgs);
    },
  };
};
