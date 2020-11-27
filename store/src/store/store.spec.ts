import { makeModel } from "../model";
import { makeStore } from "./store";

const numberModel = makeModel({
  name: "number",
  defaultState: 0,
  events: { increment: (state) => ++state },
});

describe("store", () => {
  test("getState", () => {
    const store = makeStore({ test: 0 });
    expect(store.getState()).toStrictEqual({ test: 0 });
  });
  test("replaceState", () => {
    const store = makeStore({ test: 0 });
    store.replaceState({ jest: 1 });
    expect(store.getState()).toStrictEqual({ jest: 1 });
  });
  test("dispatch", () => {
    const store = makeStore({ number: 0 });
    store.addModel(numberModel);
    store.dispatch({ type: "increment" });
    expect(store.getState()).toStrictEqual({ number: 1 });
  });
  test("subscribe", () => {
    const spy = jest.fn();
    const store = makeStore();
    store.subscribe(spy);
    store.dispatch({ type: "any" });
    expect(spy).toBeCalled();
  });
  test("unsubscribe", () => {
    const spy = jest.fn();
    const store = makeStore();
    const unsubscribe = store.subscribe(spy);
    store.dispatch({ type: "one" });
    unsubscribe();
    store.dispatch({ type: "two" });
    expect(spy).toBeCalledTimes(1);
  });
});
