import { AnyAction } from "./action";
import { Dispatch } from "./dispatch";

export type ModelFactory = typeof makeModel;
export type Model = ReturnType<ModelFactory>;

type Events = {
  [extraProps: string]: Function;
};
type Observer = (action: AnyAction, ...extraArgs: any[]) => void;

export const makeModel = <M>(name: string, defaultState: M) => {
  let observers: Observer[] = [];
  let state: M = defaultState;

  let events: Events = {
    "@init": ({ savedState }: AnyAction) => {
      if (typeof savedState !== "undefined") state = savedState;
      return state;
    },
  };

  let dispatch: Dispatch = (action, ...extraArgs) => {
    const callback = events[action.type];
    if (callback) {
      state = callback(action, ...extraArgs);
      observers.forEach((observer) => observer(action, ...extraArgs));
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
      return Object.freeze(state);
    },
    set state(nextState: M) {
      state = nextState;
    },
    observe(observer: Observer) {
      observers.push(observer);
      return () => {
        observers = observers.filter((o) => o !== observer);
      };
    },
    on<A extends AnyAction>(
      type: A["type"] | A["type"][],
      callback: (action: A) => M
    ) {
      const types = Array.isArray(type) ? type : [type];
      types.forEach((e) => {
        events[e] = callback;
        Object.freeze(events[e]);
      });
      // TODO: should be required if A has other keys than 'type'
      // https://stackoverflow.com/questions/52318011/optional-parameters-based-on-conditional-types
      return (action?: Omit<A, "type">, ...extraArgs: any[]) => () =>
        dispatch({ type: types[0], ...action }, ...extraArgs);
    },
  };
};
