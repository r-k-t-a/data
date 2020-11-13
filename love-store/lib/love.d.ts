import { AnyAction } from "./action";
import { Dispatch } from "./dispatch";
import { Store } from "./store";
import { Middleware, StateMap } from "./applyMiddleware";
export declare type LoveFactory = typeof makeLove;
export declare type Love = ReturnType<LoveFactory>;
declare type StoresMap = {
    [extraProps: string]: Store;
};
declare type Observer = (action: AnyAction, ...extraArgs: any[]) => void;
export declare const makeLove: (initialState?: StateMap | undefined, ...middleware: Middleware[]) => {
    readonly stores: StoresMap;
    dispatch: Dispatch<AnyAction>;
    observe(observer: Observer): () => void;
    registerStore(store: Store): void;
    replaceStores(nextStores: StoresMap): void;
};
export {};
