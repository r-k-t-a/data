import React from "react";
import { push, pop, reset, useStack } from "./stackModel";

export const Stack = (): JSX.Element => {
  const stack = useStack();
  return (
    <div>
      <h2>Stack state: {stack}</h2>
      <button onClick={push()}>Push</button>
      <button onClick={pop()}>Pop</button>
      <button onClick={reset()}>Reset</button>
    </div>
  );
};
