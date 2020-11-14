import { AnyAction } from "./action";
import compose from "./compose";
import { Dispatch } from "./dispatch";
import { Model } from "./model";

export type StateMap = {
  [extraProps: string]: Model["state"];
};

export type MiddlwareAPI = {
  getState(): StateMap;
  dispatch: Dispatch;
};

export type Middleware = (
  middlewareAPI: MiddlwareAPI
) => (next: Dispatch) => (action: AnyAction) => AnyAction;

export function applyMiddleware(
  middlewareAPI: MiddlwareAPI,
  ...middlewares: Middleware[]
) {
  let dispatch: Dispatch = () => {
    throw new Error(
      "Dispatching while constructing your middleware is not allowed. " +
        "Other middleware would not be applied to this dispatch."
    );
  };
  const chain = middlewares.map((middleware) =>
    middleware({ getState: middlewareAPI.getState, dispatch })
  );
  dispatch = compose(...chain)(middlewareAPI.dispatch);
  return dispatch;
}
