import { AnyAction } from "./action";
import { Dispatch } from "./dispatch";
export declare type StoreFactory = typeof makeStore;
export declare type Store = ReturnType<StoreFactory>;
export declare type AnyState = any;
export declare const makeStore: <S>(name: string, defaultState: S) => {
    dispatch: Dispatch<AnyAction>;
    readonly name: string;
    state: S;
    observe(observer: (state: S, action: AnyAction, ...extraArgs: any[]) => void): () => void;
    on<A extends AnyAction>(type: A["type"] | A["type"][], actionHandler: (action: A) => S): (action?: Pick<A, Exclude<keyof A, "type">> | undefined, ...extraArgs: any[]) => () => AnyAction;
};
//# sourceMappingURL=store.d.ts.map