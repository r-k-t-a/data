import { makeMediator } from "../mediator";
import { makeModelFactory } from "./model";

const dispatch = jest.fn();

function makeStore() {
  let state: any;
  return {
    getState<S>(): S {
      return Object.freeze(state);
    },
    setState<S>(nextState: S) {
      state = nextState;
    },
  };
}

describe("model", () => {
  it("has default state", () => {
    const store = makeStore();
    const makeModel = makeModelFactory({ id: "test", defaultState: 0 });
    const mediator = makeMediator();
    const model = makeModel({ ...store, dispatch, mediator });
    expect(model.state).toBe(0);
  });

  it("takes external state", () => {
    const store = makeStore();
    const makeModel = makeModelFactory({ id: "test", defaultState: 0 });
    const mediator = makeMediator();
    const model = makeModel({ ...store, dispatch, mediator, initialState: 1 });
    expect(model.state).toBe(1);
  });

  describe("actions", () => {
    type Add = { amount: number };
    const makeModel = makeModelFactory({
      id: "test",
      defaultState: 0,
      actions: {
        add(state, { amount }: Add) {
          return state + amount;
        },
        increment(state) {
          return (state += 1);
        },
      },
    });
    const mediator = makeMediator();
    const store = makeStore();
    const model = makeModel({
      ...store,
      dispatch: (action, ...args) => {
        mediator.publish(action.type, action, ...args);
        return action;
      },
      mediator,
    });
    model.add({ amount: 2 });
    test("add", () => {
      expect(store.getState()).toBe(2);
    });
    test("increment", () => {
      model.increment();
      expect(store.getState()).toBe(3);
    });
  });

  describe("events", () => {
    const makeModel = makeModelFactory({
      id: "test",
      defaultState: 0,
      events: { "one, two": (state) => (state += 1) },
    });
    const mediator = makeMediator();
    const store = makeStore();
    makeModel({
      ...store,
      dispatch,
      mediator,
    });

    test("one", () => {
      mediator.publish("one");
      expect(store.getState()).toBe(1);
    });
    test("two", () => {
      mediator.publish("two");
      expect(store.getState()).toBe(2);
    });
  });

  describe("lifecycle", () => {
    const mockFn = jest.fn();
    const makeModel = makeModelFactory({
      id: "test",
      defaultState: 0,
      actions: {
        reset() {
          return 0;
        },
      },
      events: { "test/@init": () => 5 },
    });
    const mediator = makeMediator();
    const store = makeStore();
    const model = makeModel({
      ...store,
      dispatch: (action, ...args) => {
        mediator.publish(action.type, action, ...args);
        return action;
      },
      mediator,
    });
    const unsubscribe = model.subscribe(mockFn);

    test("init", () => {
      expect(store.getState()).toBe(5);
    });

    test("subscribe", () => {
      model.reset();
      expect(mockFn).toBeCalledTimes(1);
    });

    it("ignores unknown events", () => {
      const spy = jest.fn();
      mediator.subscribe("unknown event", spy);
      mediator.publish("unknown event");
      expect(spy).toBeCalledTimes(1);
      expect(mockFn).toBeCalledTimes(1);
    });

    test("unsubscribe", () => {
      unsubscribe();
      model.reset();
      expect(mockFn).toBeCalledTimes(1);
    });
  });
});
