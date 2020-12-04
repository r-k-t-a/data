import { Middleware } from "./middleware";
// TODO: typings!

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: any;
  }
}

export const makeDevToolsMiddleware = (options?: any): Middleware => ({
  getState,
}) => {
  const reduxDevtoolsExtention = window?.__REDUX_DEVTOOLS_EXTENSION__;
  const extension = reduxDevtoolsExtention?.connect(options);
  extension?.init({ ...getState() });

  return (next) => (action, ...extra: any[]) => {
    const returnValue = next(action, ...extra);
    extension?.send(action.type, { ...getState() });
    return returnValue;
  };
};
