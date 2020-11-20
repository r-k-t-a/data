import { makeMediator } from "./mediator";

describe("mediator", () => {
  const mediator = makeMediator();

  it("subscribes", () => {
    const mockFn = jest.fn();
    mediator.subscribe("test/@update", mockFn);
    mediator.publish("test/@update");
    expect(mockFn).toHaveBeenCalled();
  });

  it("unsubscribes", () => {
    const mockFn = jest.fn();
    const unsubscribe = mediator.subscribe("event", mockFn);
    unsubscribe();
    mediator.publish("event");
    expect(mockFn).not.toHaveBeenCalled();
  });
});
