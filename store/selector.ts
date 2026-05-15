import type { StoreApi, UseBoundStore } from "zustand";

type SelectorMap<T extends object> = {
  [K in keyof T]: () => T[K];
};

type StoreWithSelectors<T extends object> = UseBoundStore<StoreApi<T>> & {
  use: SelectorMap<T>;
};

export const createSelectors = <T extends object>(
  storeApi: UseBoundStore<StoreApi<T>>
) => {
  const store = storeApi as StoreWithSelectors<T>;
  store.use = {} as SelectorMap<T>;

  for (const key of Object.keys(store.getState()) as Array<keyof T>) {
    store.use[key] = () => store((state) => state[key]);
  }

  return store;
};

export default createSelectors;
