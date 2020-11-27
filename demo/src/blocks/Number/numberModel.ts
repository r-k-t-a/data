import { makeModelHook } from "@rkta/store-react";

const defaultState = 0;

type NumberAdd = {
  value: number;
};

export const useNumber = makeModelHook({
  name: "number",
  defaultState,
  actions: {
    add: (state, { value }: NumberAdd) => state + value,
    increment: (state) => ++state,
    decrement: (state) => --state,
    square: (state) => state ** 2,
  },
  events: {
    reset: () => defaultState,
  },
});
