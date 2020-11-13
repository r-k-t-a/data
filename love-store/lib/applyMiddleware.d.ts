import { AnyAction } from "./action";
import { Dispatch } from "./dispatch";
import { Store } from "./store";
export declare type StateMap = {
    [extraProps: string]: Store["state"];
};
export declare type MiddlwareAPI = {
    getState(): StateMap;
    dispatch: Dispatch;
};
export declare type Middleware = (middlewareAPI: MiddlwareAPI) => (next: Dispatch) => (action: AnyAction) => AnyAction;
export declare function applyMiddleware(middlewareAPI: MiddlwareAPI, ...middlewares: Middleware[]): Dispatch<AnyAction>;
