import React from "react";
import { makeStore } from "@rkta/store";
import { Provider } from "@rkta/store-react";

import { Number } from "./blocks/Number";
import { Stack } from "./blocks/Stack";

import "./App.css";

const store = makeStore();

store.subscribe(console.log);

function App() {
  return (
    <Provider value={store}>
      <div className="app">
        <Number />
        <hr />
        <Stack />
        <hr />
        <button onClick={() => store.dispatch({ type: "reset" })}>Reset</button>
      </div>
    </Provider>
  );
}

export default App;
