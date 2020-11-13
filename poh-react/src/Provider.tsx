import React, { FC, createContext } from "react";
import { Poh } from "@poh/store";

export const Context = createContext<Poh>({} as Poh);

type Props = {
  of: Poh;
};

export const Provider: FC<Props> = ({ children, of }) => {
  return <Context.Provider value={of}>{children}</Context.Provider>;
};
