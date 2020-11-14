import { makeModel } from "@rkta/store";
import { useModel } from "@rkta/store-react";

const defaultState: number[] = [];

export const stack = makeModel("stack", defaultState);

export const push = stack.on("push", () => [
  (stack.state[0] || 0) + 1,
  ...stack.state,
]);
export const pop = stack.on("pop", () => stack.state.slice(1));
export const reset = stack.on("reset", () => defaultState);

export const useStack = () => useModel(stack).join(", ");
