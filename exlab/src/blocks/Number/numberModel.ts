import { model } from "@rkta/store";
import { useModel } from "@rkta/store-react";

const defaultState = 0;

type NumberAdd = {
  value: number;
};

export const number = model({
  id: "number",
  defaultState,
  events: {
    add: (state, { value }: NumberAdd) => state + value,
    increment: (state) => ++state,
    decrement: (state) => --state,
    pow2: (state) => state ** 2,
    reset: () => defaultState,
  },
});

export const useNumber = () => {
  const numberModel = useModel(number);
  return numberModel;
};
