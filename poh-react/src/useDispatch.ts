import { useContext } from "react";

import { Context } from "./Provider";

export const useDispatch = () => useContext(Context).dispatch;
