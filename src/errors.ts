interface CmpError {
  message: string;
}

const cmpError = (message: string): CmpError => {
  return {message};
};

function isCmpError<T>(value: CmpError|T): value is CmpError {
  if (typeof value === 'undefined') {
    return false;
  } else {
    return (value as CmpError).message !== undefined;
  }
}

function collectCmpErrors4<A, B, C, D>(
    a: CmpError|A, b: CmpError|B, c: CmpError|C,
    d: CmpError|D): CmpError|[A, B, C, D] {
  if (!isCmpError(a) && !isCmpError(b) && !isCmpError(c) && !isCmpError(d)) {
    return [a, b, c, d];
  } else {
    const combinedError =
        [a, b, c, d].filter(isCmpError).map((err) => err.message).join('; ');
    return cmpError(combinedError);
  }
}

function collectCmpErrors5<A, B, C, D, E>(
    a: CmpError|A, b: CmpError|B, c: CmpError|C, d: CmpError|D,
    e: CmpError|E): CmpError|[A, B, C, D, E] {
  if (!isCmpError(a) && !isCmpError(b) && !isCmpError(c) && !isCmpError(d) &&
      !isCmpError(e)) {
    return [a, b, c, d, e];
  } else {
    const combinedError =
        [a, b, c, d, e].filter(isCmpError).map((err) => err.message).join('; ');
    return cmpError(combinedError);
  }
}

function collectCmpErrors<T>(values: Array<CmpError|T>): CmpError|T[] {
  if (values.some(isCmpError)) {
    const combinedMessage =
        values.filter(isCmpError).map((err) => err.message).join('; ');
    return cmpError(combinedMessage);
  } else {
    // no errors exist, so we know that this is `T[]`
    return values as T[];
  }
}

export {
  cmpError,
  CmpError,
  isCmpError,
  collectCmpErrors,
  collectCmpErrors4,
  collectCmpErrors5
};
