import { useEffect, useState, useContext } from "react";

import { Store } from "@love/store/*";
import { Context } from "./Provider";

export const useStore = <S extends Store>(store: S) => {
  const { registerStore } = useContext(Context);
  registerStore(store);
  const [state, setState] = useState<S["state"]>(store.state);
  useEffect(() => store.observe(setState), [store]);
  return state;
};
