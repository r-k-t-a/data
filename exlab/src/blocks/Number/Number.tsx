import React from "react";
import { useNumber } from "./numberModel";

export const Number = (): JSX.Element => {
  const number = useNumber();
  return (
    <div>
      <h2>Number state: {number.state}</h2>
      <button onClick={() => number.decrement()}>Dencrement</button>
      <button onClick={() => number.increment()}>Increment</button>
      <button onClick={() => number.square()}>Square</button>
      <button onClick={() => number.add({ value: 10 })}>Add 10</button>
      <p>Updated: {Date.now()}</p>
    </div>
  );
};
