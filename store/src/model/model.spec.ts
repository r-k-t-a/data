import { makeModel } from "./model";
import { proxy } from "../proxy";
import { makeStore } from "../store";

const numberModel = makeModel({
  name: "number",
  defaultState: 0,
  actions: {
    increment: (state) => ++state,
    decrement: (state) => --state,
  },
  events: { reset: () => 0 },
});

const store = makeStore();
const model = proxy(store, numberModel);

const modelSpy = jest.fn();
const storeSpy = jest.fn();

store.subscribe(storeSpy);
model.subscribe(modelSpy);

describe("model", () => {
  test("default state", () => {
    expect(model.getState()).toBe(0);
  });

  test("external state", () => {
    const customStore = makeStore({ number: 1 });
    const customModel = proxy(customStore, numberModel);
    expect(customModel.getState()).toBe(1);
  });

  test("actions", () => {
    model.increment();
    expect(model.getState()).toBe(1);
    model.decrement();
    expect(model.getState()).toBe(0);
  });

  test("events", () => {
    model.increment();
    expect(model.getState()).toBe(1);
    store.dispatch({ type: "reset" });
    expect(model.getState()).toBe(0);
  });

  describe("lifecycle", () => {
    beforeEach(() => {
      store.dispatch({ type: "reset" });
      modelSpy.mockReset();
      storeSpy.mockReset();
    });

    test("init", () => {
      const customStore = makeStore();
      customStore.subscribe(storeSpy);

      const customModel = proxy(customStore, numberModel);
      customModel.subscribe(modelSpy);

      expect(storeSpy.mock.calls[0][0]).toStrictEqual({
        type: "number/@init",
      });
      expect(modelSpy).not.toBeCalled();
    });

    test("action", () => {
      model.increment();
      expect(storeSpy.mock.calls[0][0]).toStrictEqual({
        type: "number/increment",
      });
      expect(modelSpy).toBeCalledTimes(1);
    });

    test("known event", () => {
      store.dispatch({ type: "reset" });
      expect(modelSpy).toBeCalledTimes(1);
    });

    test("unknown event", () => {
      store.dispatch({ type: "unknown" });
      expect(modelSpy).toBeCalledTimes(0);
    });

    test("unsubscribe", () => {
      const spy = jest.fn();
      const unsubscribe = model.subscribe(spy);
      model.increment();
      expect(spy).toBeCalledTimes(1);
      unsubscribe();
      model.increment();
      expect(spy).toBeCalledTimes(1);
    });
  });
});
