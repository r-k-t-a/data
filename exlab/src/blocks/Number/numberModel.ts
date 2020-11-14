import { makeModel } from "@rkta/store";
import { useModel } from "@rkta/store-react";

const defaultState = 0;

export const number = makeModel("number", defaultState);

export const increment = number.on("increment", () => (number.state += 1));
export const decrement = number.on("decrement", () => (number.state -= 1));
export const pow2 = number.on("pow2", () => number.state ** 2);
export const reset = number.on("reset", () => defaultState);

type Add = {
  type: "add";
  value: number;
};
export const add = number.on<Add>(
  "add",
  ({ value }) => (number.state += value)
);

export const useNumber = () => useModel(number);
