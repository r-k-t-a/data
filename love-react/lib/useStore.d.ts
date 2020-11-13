export declare const useStore: <S extends {
    dispatch: import("@love/store").Dispatch<import("@love/store").AnyAction>;
    readonly name: string;
    state: unknown;
    observe(observer: (state: unknown, action: import("@love/store").AnyAction, ...extraArgs: any[]) => void): () => void;
    on<A extends import("@love/store").AnyAction>(type: A["type"] | A["type"][], actionHandler: (action: A) => unknown): (action?: Pick<A, Exclude<keyof A, "type">> | undefined, ...extraArgs: any[]) => () => import("@love/store").AnyAction;
}>(store: S) => S["state"];
//# sourceMappingURL=useStore.d.ts.map