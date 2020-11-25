import { useEffect, useState, useContext } from "react";
import { Model, CallbacksMap } from "@rkta/store";

import { Context } from "./Provider";

export const useModel = <F extends ReturnType<Model>>(modelFactory: F) => {
  type S = F["defaultState"];
  const { addModel } = useContext(Context);
  const model = addModel<S, CallbacksMap<S>>(modelFactory);
  const [, setState] = useState(model.state);
  useEffect(() => model.subscribe(setState), [model]);
  return modelFactory.defaultState;
};
