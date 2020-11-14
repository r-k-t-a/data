import React from "react";
import { decrement, increment, pow2, reset, useNumber } from "./numberModel";

export const Number = (): JSX.Element => {
  const number = useNumber();
  return (
    <div>
      <h2>Number state: {number}</h2>
      <button onClick={decrement()}>Dencrement</button>
      <button onClick={increment()}>Increment</button>
      <button onClick={pow2()}>Square</button>
      <button onClick={reset()}>Reset</button>
    </div>
  );
};
