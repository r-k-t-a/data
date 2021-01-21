import React from "react";
import { makeStore, makeDevToolsMiddleware } from "@rkta/store";
import { Provider } from "@rkta/store-react";
import {
  makeWebsocketClientConnection,
  makeCrosstabConnection,
} from "@rkta/connection";
import { makeClient } from "@rkta/client";

import { Number } from "./blocks/Number";
import { Stack } from "./blocks/Stack";

import "./App.css";

const store = makeStore({}, makeDevToolsMiddleware());

const connectWebsocket = () => new WebSocket("ws://localhost:8080");
const websocketConnection = makeWebsocketClientConnection(connectWebsocket);
const crosstabConnection = makeCrosstabConnection();

makeClient({ websocketConnection, crosstabConnection, store });

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
