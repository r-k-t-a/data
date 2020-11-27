import { makeModelHook } from "@rkta/store-react";

const defaultState: number[] = [0];

export const useStack = makeModelHook({
  name: "stack",
  defaultState,
  actions: {
    pop: (state) => state.slice(1),
    push: (state, { item }: { item: number }) => [item, ...state],
  },
  events: {
    reset: () => defaultState,
  },
});
