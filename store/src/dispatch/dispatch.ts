import { Action, AnyAction } from "../action";

export interface Dispatch<A extends Action = AnyAction> {
  <T extends A>(action: T, ...extraArgs: any[]): A;
}
