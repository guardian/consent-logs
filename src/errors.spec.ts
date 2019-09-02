/* tslint:disable:no-any */
import fc from 'fast-check';

import {CmpError, cmpError, collectCmpErrors, collectCmpErrors4, collectCmpErrors6, isCmpError} from './errors';

describe('isCmpError', () => {
  test('returns true for a value that is a cmpError', () => {
    const value: string|CmpError = cmpError('test error');
    expect(isCmpError(value)).toBeTruthy();
  });

  test('returns false for a value that is not a CmpError', () => {
    const value: string|CmpError = 'not an error';
    expect(isCmpError(value)).toBeFalsy();
  });
});

describe('collectCmpErrors4', () => {
  test('retuns the four successful values if all four succeeded', () => {
    const a: string|CmpError = 'string';
    const b: number|CmpError = 1;
    const c: boolean|CmpError = false;
    const d: number[]|CmpError = [1, 2, 3];
    expect(collectCmpErrors4(a, b, c, d)).toEqual([a, b, c, d]);
  });

  test('retuns a CmpError if the first item is a failure', () => {
    const a: string|CmpError = cmpError('first item failure');
    const b: number|CmpError = 1;
    const c: boolean|CmpError = false;
    const d: number[]|CmpError = [1, 2, 3];
    expect(isCmpError(collectCmpErrors4(a, b, c, d))).toBeTruthy();
  });

  test('retuns a CmpError if the second item is a failure', () => {
    const a: string|CmpError = 'string';
    const b: number|CmpError = cmpError('second item failure');
    const c: boolean|CmpError = false;
    const d: number[]|CmpError = [1, 2, 3];
    expect(isCmpError(collectCmpErrors4(a, b, c, d))).toBeTruthy();
  });

  test('retuns a CmpError if the third item is a failure', () => {
    const a: string|CmpError = 'string';
    const b: number|CmpError = 1;
    const c: boolean|CmpError = cmpError('third item failure');
    const d: number[]|CmpError = [1, 2, 3];
    expect(isCmpError(collectCmpErrors4(a, b, c, d))).toBeTruthy();
  });

  test('retuns a CmpError if the fourth item is a failure', () => {
    const a: string|CmpError = 'string';
    const b: number|CmpError = 1;
    const c: boolean|CmpError = false;
    const d: number[]|CmpError = cmpError('fourth item failure');
    expect(isCmpError(collectCmpErrors4(a, b, c, d))).toBeTruthy();
  });

  test('returns the provided error message for a single failure', () => {
    const a: string|CmpError = cmpError('test error message');
    const b: number|CmpError = 1;
    const c: boolean|CmpError = false;
    const d: number[]|CmpError = [1, 2, 3];
    const result = collectCmpErrors4(a, b, c, d);
    if (isCmpError(result)) {
      expect(result.message).toEqual('test error message');
    } else {
      fail('call should have returned a CmpError instance');
    }
  });

  test('returns concatenated error message for multiple failures', () => {
    const a: string|CmpError = cmpError('test error message');
    const b: number|CmpError = cmpError('another error message');
    const c: boolean|CmpError = false;
    const d: number[]|CmpError = [1, 2, 3];
    const result = collectCmpErrors4(a, b, c, d);
    if (isCmpError(result)) {
      expect(result.message)
          .toEqual('test error message, another error message');
    } else {
      fail('call should have returned a CmpError instance');
    }
  });
});

describe('collectCmpErrors6', () => {
  test('retuns the four successful values if all six succeeded', () => {
    const a: string|CmpError = 'string';
    const b: number|CmpError = 1;
    const c: boolean|CmpError = false;
    const d: number[]|CmpError = [1, 2, 3];
    const e: string[]|CmpError = ['foo', 'bar'];
    const f: boolean[]|CmpError = [true, false];
    expect(collectCmpErrors6(a, b, c, d, e, f)).toEqual([a, b, c, d, e, f]);
  });

  test('retuns a CmpError if the first item is a failure', () => {
    const a: string|CmpError = cmpError('first item failure');
    const b: number|CmpError = 1;
    const c: boolean|CmpError = false;
    const d: number[]|CmpError = [1, 2, 3];
    const e: string[]|CmpError = ['foo', 'bar'];
    const f: boolean[]|CmpError = [true, false];
    expect(isCmpError(collectCmpErrors6(a, b, c, d, e, f))).toBeTruthy();
  });

  test('retuns a CmpError if the second item is a failure', () => {
    const a: string|CmpError = 'string';
    const b: number|CmpError = cmpError('second item failure');
    const c: boolean|CmpError = false;
    const d: number[]|CmpError = [1, 2, 3];
    const e: string[]|CmpError = ['foo', 'bar'];
    const f: boolean[]|CmpError = [true, false];
    expect(isCmpError(collectCmpErrors6(a, b, c, d, e, f))).toBeTruthy();
  });

  test('retuns a CmpError if the third item is a failure', () => {
    const a: string|CmpError = 'string';
    const b: number|CmpError = 1;
    const c: boolean|CmpError = cmpError('third item failure');
    const d: number[]|CmpError = [1, 2, 3];
    const e: string[]|CmpError = ['foo', 'bar'];
    const f: boolean[]|CmpError = [true, false];
    expect(isCmpError(collectCmpErrors6(a, b, c, d, e, f))).toBeTruthy();
  });

  test('retuns a CmpError if the fourth item is a failure', () => {
    const a: string|CmpError = 'string';
    const b: number|CmpError = 1;
    const c: boolean|CmpError = false;
    const d: number[]|CmpError = cmpError('fourth item failure');
    const e: string[]|CmpError = ['foo', 'bar'];
    const f: boolean[]|CmpError = [true, false];
    expect(isCmpError(collectCmpErrors6(a, b, c, d, e, f))).toBeTruthy();
  });

  test('retuns a CmpError if the fifth item is a failure', () => {
    const a: string|CmpError = 'string';
    const b: number|CmpError = 1;
    const c: boolean|CmpError = false;
    const d: number[]|CmpError = [1, 2, 3];
    const e: string[]|CmpError = cmpError('fifth item failure');
    const f: boolean[]|CmpError = [true, false];
    expect(isCmpError(collectCmpErrors6(a, b, c, d, e, f))).toBeTruthy();
  });

  test('retuns a CmpError if the sixth item is a failure', () => {
    const a: string|CmpError = 'string';
    const b: number|CmpError = 1;
    const c: boolean|CmpError = false;
    const d: number[]|CmpError = [1, 2, 3];
    const e: string[]|CmpError = ['foo', 'bar'];
    const f: boolean[]|CmpError = cmpError('sixth item failure');
    expect(isCmpError(collectCmpErrors6(a, b, c, d, e, f))).toBeTruthy();
  });

  test('returns the provided error message for a single failure', () => {
    const a: string|CmpError = cmpError('test error message');
    const b: number|CmpError = 1;
    const c: boolean|CmpError = false;
    const d: number[]|CmpError = [1, 2, 3];
    const e: string[]|CmpError = ['foo', 'bar'];
    const f: boolean[]|CmpError = [true, false];
    const result = collectCmpErrors6(a, b, c, d, e, f);
    if (isCmpError(result)) {
      expect(result.message).toEqual('test error message');
    } else {
      fail('call should have returned a CmpError instance');
    }
  });

  test('returns concatenated error message for multiple failures', () => {
    const a: string|CmpError = cmpError('test error message');
    const b: number|CmpError = cmpError('another error message');
    const c: boolean|CmpError = false;
    const d: number[]|CmpError = [1, 2, 3];
    const e: string[]|CmpError = ['foo', 'bar'];
    const f: boolean[]|CmpError = [true, false];
    const result = collectCmpErrors6(a, b, c, d, e, f);
    if (isCmpError(result)) {
      expect(result.message)
          .toEqual('test error message, another error message');
    } else {
      fail('call should have returned a CmpError instance');
    }
  });
});

describe('collectCmpErrors', () => {
  test('retuns the successful values if they all succeeded', () => {
    const generator = fc.array(fc.integer());
    fc.assert(fc.property(generator, (arr) => {
      expect(collectCmpErrors(arr)).toEqual(arr);
    }));
  });

  test('retuns a CmpError if one exists in the list', () => {
    const result = collectCmpErrors([cmpError('error'), 1, 2, 3, 4]);
    expect(isCmpError(result)).toBeTruthy();
  });

  test('retuns a CmpError if one exists in the list', () => {
    const result = collectCmpErrors([1, 2, cmpError('error'), 3, 4]);
    expect(isCmpError(result)).toBeTruthy();
  });

  test('takes the overall CmpError message from a single error', () => {
    const result = collectCmpErrors([cmpError('test error message'), 1]);
    if (isCmpError(result)) {
      expect(result.message).toEqual('test error message');
    } else {
      fail('call should have returned a CmpError instance');
    }
  });

  test('takes the overall CmpError message from a single error', () => {
    const result = collectCmpErrors(
        [cmpError('test error message'), cmpError('another error message'), 1]);
    if (isCmpError(result)) {
      expect(result.message)
          .toEqual('test error message, another error message');
    } else {
      fail('call should have returned a CmpError instance');
    }
  });
});
