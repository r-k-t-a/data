import React from "react";
import { useStack } from "./stackModel";

export const Stack = (): JSX.Element => {
  const stack = useStack();
  return (
    <div>
      <h2>Stack state: {stack}</h2>
      <button onClick={() => stack.push()}>Push</button>
      <button onClick={() => stack.pop()}>Pop</button>
      <button onClick={() => stack.reset()}>Reset</button>
    </div>
  );
};
