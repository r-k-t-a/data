import { makeStore } from "../store";

function makeTestStore(state?: Record<string, any>) {
  const modelSpy = jest.fn();
  const storeSpy = jest.fn();
  const store = makeStore(state);
  const unsubsribeStore = store.subscribe(storeSpy);
  const model = store.addModel({
    name: "number",
    defaultState: 0,
    actions: {
      increment: (state) => ++state,
      decrement: (state) => --state,
    },
    events: { reset: () => 0 },
  });
  const unsubsribeModel = model.subscribe(modelSpy);
  return { model, modelSpy, store, storeSpy, unsubsribeModel, unsubsribeStore };
}

describe("model", () => {
  test("default state", () => {
    const { model } = makeTestStore();
    expect(model.getState()).toBe(0);
  });

  test("external state", () => {
    const { model } = makeTestStore({ number: 1 });
    expect(model.getState()).toBe(1);
  });

  test("actions", () => {
    const { model } = makeTestStore();
    model.increment();
    expect(model.getState()).toBe(1);
    model.decrement();
    expect(model.getState()).toBe(0);
  });

  test("events", () => {
    const { model, store } = makeTestStore();
    model.increment();
    expect(model.getState()).toBe(1);
    store.dispatch({ type: "reset" });
    expect(model.getState()).toBe(0);
  });

  describe("lifecycle", () => {
    test("init", () => {
      const { modelSpy, storeSpy } = makeTestStore();
      expect(storeSpy.mock.calls[0][0]).toStrictEqual({
        type: "number/@init",
        initState: 0,
      });
      expect(modelSpy).not.toBeCalled();
    });

    test("action", () => {
      const { model, modelSpy, storeSpy } = makeTestStore();
      model.increment();
      expect(storeSpy.mock.calls[1][0]).toStrictEqual({
        type: "number/increment",
      });
      expect(modelSpy).toBeCalledTimes(1);
    });

    test("known event", () => {
      const { modelSpy, store } = makeTestStore();
      store.dispatch({ type: "reset" });
      expect(modelSpy).toBeCalledTimes(1);
    });

    test("unknown event", () => {
      const { modelSpy, store } = makeTestStore();
      store.dispatch({ type: "unknown" });
      expect(modelSpy).toBeCalledTimes(0);
    });

    test("unsubscribe", () => {
      const { modelSpy, model, unsubsribeModel } = makeTestStore();
      model.increment();
      expect(modelSpy).toBeCalledTimes(1);
      unsubsribeModel();
      model.increment();
      expect(modelSpy).toBeCalledTimes(1);
    });
  });
});
