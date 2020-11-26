import { useMemo, useContext } from "react";
import { Model, ModelCallbacksMap, proxy, ProxiedModel } from "@rkta/store";

import { Context } from "./Provider";

type UseModel<S, A extends ModelCallbacksMap<S>> = { state: S } & Omit<
  ProxiedModel<S, A>,
  "getState"
>;

export const useModel = <S, A extends ModelCallbacksMap<S>>(
  model: Model<S, A>
) => {
  const store = useContext(Context);

  const { getState, ...rest }: ProxiedModel<S, A> = useMemo(
    () => proxy<S, A>(store, model),
    [model.name]
  );

  return { state: getState(), ...rest } as UseModel<S, A>;
};

export const makeModelHook = <S, A extends ModelCallbacksMap<S>>(
  model: Model<S, A>
) => (): UseModel<S, A> => useModel(model);
