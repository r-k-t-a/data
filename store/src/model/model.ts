import { AnyAction } from "../action";
import { Dispatch } from "../dispatch";
import { Mediator } from "../mediator";

export type MakeModelFactory = typeof makeModelFactory;
export type ModelFactory = ReturnType<MakeModelFactory>;
export type Model = ReturnType<ModelFactory>;

export interface ModelCallback<S> {
  (state: S, ...extraArgs: any[]): S;
}

type ActionProducers<S, A extends Record<string, ModelCallback<S>>> = {
  [P in keyof A]: (
    ...args: Parameters<A[P]>[1] extends undefined
      ? []
      : [action: Parameters<A[P]>[1], ...extra: any[]]
  ) => AnyAction;
};

type ModelFactoryProps<S> = {
  dispatch: Dispatch;
  initialState?: S;
  getState(): S;
  mediator: Mediator;
  setState(nextState: S): void;
};

export const makeModelFactory = <
  S,
  A extends Record<string, ModelCallback<S>>,
  E extends Record<string, ModelCallback<S>>
>({
  id,
  actions,
  defaultState,
  events,
}: {
  id: string;
  defaultState: S;
  actions?: A;
  events?: E;
}) => {
  function modelFactory({
    dispatch,
    initialState,
    getState,
    mediator,
    setState,
  }: ModelFactoryProps<S>) {
    const getLocalType = (topic: string) => `${id}/${topic}`;
    const initType = getLocalType("@init");
    const updateType = getLocalType("@update");

    function runCallback(callback: ModelCallback<S>, ...args: any[]) {
      const nextState = callback(getState(), ...args);
      setState(nextState);
      mediator.publish(updateType);
    }

    Object.entries(events || []).forEach(([key, callback]) => {
      key.split(",").forEach((topic) => {
        mediator.subscribe(
          topic.trim(),
          (...args: Parameters<typeof callback>) => {
            runCallback(callback, ...args);
          }
        );
      });
    });

    setState(typeof initialState === "undefined" ? defaultState : initialState);

    mediator.publish(initType, { type: initType });
    // mediator.subscribe(updateType, () => console.log("-----", updateType));

    return {
      ...Object.entries(actions || []).reduce((acc, [topic, callback]) => {
        const type = getLocalType(topic);
        mediator.subscribe(type, (...args: any[]) => {
          runCallback(callback, ...args);
        });
        return {
          ...acc,
          [topic]: (action, ...extraArgs) => {
            dispatch({ ...action, type }, ...extraArgs);
          },
        };
      }, {} as ActionProducers<S, A>),
      get state() {
        return getState();
      },
      subscribe(callback: () => void) {
        return mediator.subscribe(updateType, callback);
      },
    };
  }
  return Object.assign(modelFactory, { id, defaultState });
};
