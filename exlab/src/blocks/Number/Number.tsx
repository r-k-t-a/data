import React from "react";
import { useNumber } from "./numberModel";

export const Number = (): JSX.Element => {
  const number = useNumber();
  return (
    <div>
      <h2>Number state: {number}</h2>
      <button onClick={() => number.decrement()}>Dencrement</button>
      <button onClick={() => number.increment()}>Increment</button>
      <button onClick={() => number.pow2()}>Square</button>
      <button onClick={() => number.reset()}>Reset</button>
      <button onClick={() => number.add({ value: 10 })}>Add 10</button>
    </div>
  );
};
