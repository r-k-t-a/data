export interface Action<A = string> {
  type: A;
}

export interface AnyAction extends Action {
  [extraProps: string]: any;
}
