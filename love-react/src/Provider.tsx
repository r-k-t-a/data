import React, { FC, createContext } from "react";
import { Love } from "@love/store";

export const Context = createContext<Love>({} as Love);

type Props = {
  of: Love;
};

export const Provider: FC<Props> = ({ children, of }) => {
  return <Context.Provider value={of}>{children}</Context.Provider>;
};
