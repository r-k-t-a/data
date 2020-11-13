import { AnyAction } from "./action";
import { Dispatch } from "./dispatch";
import { Store } from "./store";
import { applyMiddleware, Middleware, StateMap } from "./applyMiddleware";

export type PohFactory = typeof makePoh;
export type Poh = ReturnType<PohFactory>;

type StoresMap = {
  [extraProps: string]: Store;
};
type Observer = (action: AnyAction, ...extraArgs: any[]) => void;

export const makePoh = (
  initialState?: StateMap,
  ...middleware: Middleware[]
) => {
  let stores: StoresMap = {};
  let observers: Observer[] = [];
  let silent: boolean = false;

  function notifyObservers(action: AnyAction, ...extraArgs: any[]) {
    if (!silent)
      observers.forEach((observer) => observer(action, ...extraArgs));
  }

  function getState(): StateMap {
    return Object.entries(stores).reduce(
      (acc, [key, store]) => ({ ...acc, [key]: store.state }),
      {}
    );
  }

  const pohDispatch: Dispatch = (action, ...extraArgs) => {
    silent = true;
    Object.values(stores).forEach((store) =>
      store.dispatch(action, ...extraArgs)
    );
    silent = false;
    notifyObservers(action, ...extraArgs);
    return action;
  };

  const dispatch = applyMiddleware(
    { getState, dispatch: pohDispatch },
    ...middleware
  );

  return {
    get stores() {
      return stores;
    },
    dispatch,
    observe(observer: Observer) {
      observers.push(observer);
      return () => {
        observers = observers.filter(
          (currentObserver) => currentObserver !== observer
        );
      };
    },
    registerStore(store: Store) {
      if (!(store.name in stores)) {
        stores[store.name] = store;
        store.dispatch = applyMiddleware(
          { getState, dispatch: store.dispatch },
          ...middleware
        );
        store.observe((state, action, ...extraArgs) =>
          notifyObservers(action, ...extraArgs)
        );
        const savedState = initialState?.[store.name];
        store.dispatch({ type: "@init", savedState });
      }
    },
    replaceStores(nextStores: StoresMap) {
      stores = nextStores;
    },
  };
};
