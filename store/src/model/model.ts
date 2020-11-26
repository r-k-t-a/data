export type ModelCallback<S> = (state: S, ...extraArgs: any[]) => S;

export type ModelCallbacksMap<S> = Record<string, ModelCallback<S>>;

export type Model<S, A extends ModelCallbacksMap<S>> = {
  actions?: A;
  events?: ModelCallbacksMap<S>;
  name: string;
  defaultState: S;
};

type ModelFactory = <S extends any, A extends ModelCallbacksMap<S>>(
  props: Model<S, A>
) => Readonly<Model<S, A>>;

export const makeModel: ModelFactory = <S, A extends ModelCallbacksMap<S>>(
  model: Model<S, A>
): Model<S, A> => model;
