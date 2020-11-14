import { AnyAction } from "./action";
import { Dispatch } from "./dispatch";

export type ModelFactory = typeof makeModel;
export type Model = ReturnType<ModelFactory>;

type Events = {
  [extraProps: string]: Function;
};
type Observer = (action: AnyAction, ...extraArgs: any[]) => void;

export const makeModel = <S>(name: string, defaultState: S) => {
  let observers: Observer[] = [];
  let state: S = defaultState;

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
      console.log("state: ", state);
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
    set state(nextState: S) {
      state = nextState;
    },
    observe(observer: Observer) {
      observers.push(observer);
      return () => {
        observers = observers.filter((o) => o !== observer);
      };
    },
    on<A extends AnyAction | undefined = undefined>(
      type: string | string[],
      callback: (action: A) => S
    ) {
      const types = Array.isArray(type) ? type : [type];
      types.forEach((e) => {
        if (e in events) {
          throw new Error(`Event ${e} already exists in model #{name}`);
        }
        events[e] = callback;
      });

      return (
        ...args: A extends undefined
          ? []
          : [action: Omit<A, "type">, ...extraArgs: any[]]
      ) => () => {
        const [action, ...extraArgs] = args;
        dispatch({ type: types[0], ...action }, ...extraArgs);
      };
    },
  };
};
