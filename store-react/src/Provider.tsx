import React, { FC, createContext } from "react";
import { Store } from "@rkta/store";

export const Context = createContext<Store>({} as Store);

type Props = {
  value: Store;
};

export const Provider: FC<Props> = ({ children, value }) => {
  return <Context.Provider value={value}>{children}</Context.Provider>;
};
