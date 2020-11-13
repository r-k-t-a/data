import React, { FC } from "react";
import { Love } from "@love/store";
export declare const Context: React.Context<{
    readonly stores: {
        [extraProps: string]: {
            dispatch: import("@love/store").Dispatch<import("@love/store").AnyAction>;
            readonly name: string;
            state: unknown;
            observe(observer: (state: unknown, action: import("@love/store").AnyAction, ...extraArgs: any[]) => void): () => void;
            on<A extends import("@love/store").AnyAction>(type: A["type"] | A["type"][], actionHandler: (action: A) => unknown): (action?: Pick<A, Exclude<keyof A, "type">> | undefined, ...extraArgs: any[]) => () => import("@love/store").AnyAction;
        };
    };
    dispatch: import("@love/store").Dispatch<import("@love/store").AnyAction>;
    observe(observer: (action: import("@love/store").AnyAction, ...extraArgs: any[]) => void): () => void;
    registerStore(store: {
        dispatch: import("@love/store").Dispatch<import("@love/store").AnyAction>;
        readonly name: string;
        state: unknown;
        observe(observer: (state: unknown, action: import("@love/store").AnyAction, ...extraArgs: any[]) => void): () => void;
        on<A extends import("@love/store").AnyAction>(type: A["type"] | A["type"][], actionHandler: (action: A) => unknown): (action?: Pick<A, Exclude<keyof A, "type">> | undefined, ...extraArgs: any[]) => () => import("@love/store").AnyAction;
    }): void;
    replaceStores(nextStores: {
        [extraProps: string]: {
            dispatch: import("@love/store").Dispatch<import("@love/store").AnyAction>;
            readonly name: string;
            state: unknown;
            observe(observer: (state: unknown, action: import("@love/store").AnyAction, ...extraArgs: any[]) => void): () => void;
            on<A extends import("@love/store").AnyAction>(type: A["type"] | A["type"][], actionHandler: (action: A) => unknown): (action?: Pick<A, Exclude<keyof A, "type">> | undefined, ...extraArgs: any[]) => () => import("@love/store").AnyAction;
        };
    }): void;
}>;
declare type Props = {
    of: Love;
};
export declare const Provider: FC<Props>;
export {};
