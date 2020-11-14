import React from "react";
import { makeStore } from "@rkta/store";
import { Provider } from "@rkta/store-react";

import "./App.css";

const store = makeStore();

function App() {
  return (
    <Provider value={store}>
      <div className="App">react app</div>
    </Provider>
  );
}

export default App;
