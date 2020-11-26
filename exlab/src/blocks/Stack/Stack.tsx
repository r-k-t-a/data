import React from "react";
import { useStack } from "./stackModel";

export const Stack = (): JSX.Element => {
  const stack = useStack();
  return (
    <div>
      <h2>Stack state: {stack.state.join(", ")}</h2>
      <button onClick={() => stack.push()}>Push</button>
      <button onClick={() => stack.pop()}>Pop</button>
    </div>
  );
};
