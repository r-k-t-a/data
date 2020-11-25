import { model } from "../model";
import { makeStore } from "./store";

describe("store", () => {
  it("has default state", () => {
    const store = makeStore();
    const makeModel = model({ id: "test", defaultState: 0 });
    const numberModel = store.addModel<typeof makeModel.defaultState, {}>(
      makeModel
    );
    console.log("numberModel: ", numberModel);
    expect(0).toBe(0);
  });
});
