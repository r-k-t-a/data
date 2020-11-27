import { compose } from "@rkta/patterns";
import { AnyAction } from "../action";
import { Dispatch } from "../dispatch";

export type MiddlwareAPI = {
  getState(): Record<string, any>;
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
