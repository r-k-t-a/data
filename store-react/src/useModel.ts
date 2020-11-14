import { useEffect, useState, useContext } from "react";
import { Model } from "@rkta/store";

import { Context } from "./Provider";

export const useModel = <M extends Model>(model: M) => {
  const { registerStore } = useContext(Context);
  registerStore(model);
  const [state, setState] = useState<M["state"]>(model.state);
  useEffect(() => model.observe(() => setState(model.state)), [model]);
  return state;
};
