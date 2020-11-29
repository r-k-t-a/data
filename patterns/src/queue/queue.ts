export const makeQueue = <I>() => {
  let queue: I[] = [];
  return {
    add(item: I): void {
      queue = [...queue, item];
    },
    get items(): I[] {
      return queue;
    },
    remove(item: I): void {
      queue = queue.filter((currenItem) => currenItem !== item);
    },
  };
};
