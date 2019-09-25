export function strEnum<T extends string>(o: ReadonlyArray<T>): {[K in T]: K} {
  return o.reduce((res, key) => {
    res[key] = key;
    return res;
  }, Object.create(null));
}

export function assertUnreachable(x: never): never {
  throw new Error('Unreachable code: compile-time check');
}

export function copy(arr: ReadonlyArray<string>): string[] {
  return arr.map((i) => i);
}
