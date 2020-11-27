# @rtka/store

A redux-inspired state machine store which is designed to bypass redux performance limitations and complexity.

## JS example

### Make store
```javascript
import { makeStore } from '@rkta/store';

const basicStore = makeStore();
const advancedStore = makeStore(restoredState, ...middleware);

```

### Make model
```javascript
import { makeModel } from '@rkta/store';

const number = makeModel({
  name: "number",
  defaultState: 0,
  actions: {
    increment: (state) => ++state,
  },
  events: {
    reset: () => 0,
  },
});
```

### Add model to store
```javascript

store.addModel(number);

```

### Execute model actions
```javascript

number.increment();

console.log(number.getState()); // => 1
console.log(store.getState()); // => { number: 1}

```

### Dispatch global events
```javascript

store.dispatch({ type: 'reset' });

console.log(number.getState()); // => 0
console.log(store.getState()); // => { number: 0}

```


## React example

### Make store
```javascript
import React from "react";
import { makeStore } from "@rkta/store";
import { Provider } from "@rkta/store-react";

const store = makeStore();

function App() {
  return (
    <Provider value={store}>
      ...appplication code
    </Provider>
  );
}
```

### Make model hook
```javascript
import { makeModelHook } from '@rkta/store-react';

const useNumber = makeModelHook({
  name: "number",
  defaultState: 0,
  actions: {
    increment: (state) => ++state,
    decrement: (state) => --state,
  },
  events: {
    reset: () => 0,
  },
});
```

### Use model and store in react
```javascript
import { makeModelHook, useDispatch } from '@rkta/store-react';

function Number() {
  const dispatch = useDispatch();
  const number = useNumber();
  return (
    <div>
      <h2>Number state: {number.state}</h2>
      <button onClick={() => number.decrement()}>Dencrement</button>
      <button onClick={() => number.increment()}>Increment</button>
      <p>Updated: {Date.now()}</p>
      <hr />
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </div>
  );
};
```