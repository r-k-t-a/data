import { useState, useEffect, useContext } from "react";
import { Model, ModelCallbacksMap, ProxiedModel } from "@rkta/store";

import { Context } from "./Provider";

type UseModel<S, A extends ModelCallbacksMap<S>> = { state: S } & Omit<
  ProxiedModel<S, A>,
  "getState"
>;

export const useModel = <S, A extends ModelCallbacksMap<S>>(
  model: Model<S, A>
) => {
  const [, setState] = useState(0);
  const store = useContext(Context);

  const proxiedModel = store.addModel(model);

  useEffect(
    () =>
      proxiedModel.subscribe(() => {
        setState((prevState) => ++prevState);
      }),
    [model.name]
  );

  const { getState, ...rest } = proxiedModel;

  return { state: getState(), ...rest } as UseModel<S, A>;
};

export const makeModelHook = <S, A extends ModelCallbacksMap<S>>(
  model: Model<S, A>
) => (): UseModel<S, A> => useModel(model);
