/* tslint:disable:no-any */
import fc from 'fast-check';

import {addCmpExtensions} from './cmpErrorTestExtensions';
import {CmpError, cmpError, collectCmpErrors, collectCmpErrors4, collectCmpErrors5, isCmpError} from './errors';

addCmpExtensions();

describe('isCmpError', () => {
  test('returns true for a value that is a cmpError', () => {
    const value: string|CmpError = cmpError('test error');
    expect(isCmpError(value)).toBe(true);
  });

  test('returns false for a value that is not a CmpError', () => {
    const value: string|CmpError = 'not an error';
    expect(isCmpError(value)).toBe(false);
  });

  test('returns false for an undefined value', () => {
    expect(isCmpError(undefined)).toBe(false);
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
    expect(collectCmpErrors4(a, b, c, d)).toBeCmpError();
  });

  test('retuns a CmpError if the second item is a failure', () => {
    const a: string|CmpError = 'string';
    const b: number|CmpError = cmpError('second item failure');
    const c: boolean|CmpError = false;
    const d: number[]|CmpError = [1, 2, 3];
    expect(collectCmpErrors4(a, b, c, d)).toBeCmpError();
  });

  test('retuns a CmpError if the third item is a failure', () => {
    const a: string|CmpError = 'string';
    const b: number|CmpError = 1;
    const c: boolean|CmpError = cmpError('third item failure');
    const d: number[]|CmpError = [1, 2, 3];
    expect(collectCmpErrors4(a, b, c, d)).toBeCmpError();
  });

  test('retuns a CmpError if the fourth item is a failure', () => {
    const a: string|CmpError = 'string';
    const b: number|CmpError = 1;
    const c: boolean|CmpError = false;
    const d: number[]|CmpError = cmpError('fourth item failure');
    expect(collectCmpErrors4(a, b, c, d)).toBeCmpError();
  });

  test('returns the provided error message for a single failure', () => {
    const a: string|CmpError = cmpError('test error message');
    const b: number|CmpError = 1;
    const c: boolean|CmpError = false;
    const d: number[]|CmpError = [1, 2, 3];
    const result = collectCmpErrors4(a, b, c, d);
    expect(result).toBeCmpErrorWithMessage('test error message');
  });

  test('returns concatenated error message for multiple failures', () => {
    const a: string|CmpError = cmpError('test error message');
    const b: number|CmpError = cmpError('another error message');
    const c: boolean|CmpError = false;
    const d: number[]|CmpError = [1, 2, 3];
    const result = collectCmpErrors4(a, b, c, d);
    expect(result).toBeCmpErrorWithMessage(
        'test error message; another error message');
  });
});

describe('collectCmpErrors6', () => {
  test('retuns the four successful values if all six succeeded', () => {
    const a: string|CmpError = 'string';
    const b: number|CmpError = 1;
    const c: boolean|CmpError = false;
    const d: number[]|CmpError = [1, 2, 3];
    const e: string[]|CmpError = ['foo', 'bar'];
    expect(collectCmpErrors5(a, b, c, d, e)).toEqual([a, b, c, d, e]);
  });

  test('retuns a CmpError if the first item is a failure', () => {
    const a: string|CmpError = cmpError('first item failure');
    const b: number|CmpError = 1;
    const c: boolean|CmpError = false;
    const d: number[]|CmpError = [1, 2, 3];
    const e: string[]|CmpError = ['foo', 'bar'];
    expect(collectCmpErrors5(a, b, c, d, e)).toBeCmpError();
  });

  test('retuns a CmpError if the second item is a failure', () => {
    const a: string|CmpError = 'string';
    const b: number|CmpError = cmpError('second item failure');
    const c: boolean|CmpError = false;
    const d: number[]|CmpError = [1, 2, 3];
    const e: string[]|CmpError = ['foo', 'bar'];
    expect(collectCmpErrors5(a, b, c, d, e)).toBeCmpError();
  });

  test('retuns a CmpError if the third item is a failure', () => {
    const a: string|CmpError = 'string';
    const b: number|CmpError = 1;
    const c: boolean|CmpError = cmpError('third item failure');
    const d: number[]|CmpError = [1, 2, 3];
    const e: string[]|CmpError = ['foo', 'bar'];
    expect(collectCmpErrors5(a, b, c, d, e)).toBeCmpError();
  });

  test('retuns a CmpError if the fourth item is a failure', () => {
    const a: string|CmpError = 'string';
    const b: number|CmpError = 1;
    const c: boolean|CmpError = false;
    const d: number[]|CmpError = cmpError('fourth item failure');
    const e: string[]|CmpError = ['foo', 'bar'];
    expect(collectCmpErrors5(a, b, c, d, e)).toBeCmpError();
  });

  test('retuns a CmpError if the fifth item is a failure', () => {
    const a: string|CmpError = 'string';
    const b: number|CmpError = 1;
    const c: boolean|CmpError = false;
    const d: number[]|CmpError = [1, 2, 3];
    const e: string[]|CmpError = cmpError('fifth item failure');
    expect(collectCmpErrors5(a, b, c, d, e)).toBeCmpError();
  });


  test('returns the provided error message for a single failure', () => {
    const a: string|CmpError = cmpError('test error message');
    const b: number|CmpError = 1;
    const c: boolean|CmpError = false;
    const d: number[]|CmpError = [1, 2, 3];
    const e: string[]|CmpError = ['foo', 'bar'];
    const result = collectCmpErrors5(a, b, c, d, e);
    expect(result).toBeCmpErrorWithMessage('test error message');
  });

  test('returns concatenated error message for multiple failures', () => {
    const a: string|CmpError = cmpError('test error message');
    const b: number|CmpError = cmpError('another error message');
    const c: boolean|CmpError = false;
    const d: number[]|CmpError = [1, 2, 3];
    const e: string[]|CmpError = ['foo', 'bar'];
    const result = collectCmpErrors5(a, b, c, d, e);
    expect(result).toBeCmpErrorWithMessage(
        'test error message; another error message');
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
    expect(result).toBeCmpError();
  });

  test('retuns a CmpError if one exists in the list', () => {
    const result = collectCmpErrors([1, 2, cmpError('error'), 3, 4]);
    expect(result).toBeCmpError();
  });

  test('takes the overall CmpError message from a single error', () => {
    const result = collectCmpErrors([cmpError('test error message'), 1]);
    expect(result).toBeCmpErrorWithMessage('test error message');
  });

  test('takes the overall CmpError message from a single error', () => {
    const result = collectCmpErrors(
        [cmpError('test error message'), cmpError('another error message'), 1]);
    expect(result).toBeCmpErrorWithMessage(
        'test error message; another error message');
  });
});

describe('toBeCmpError matcher', () => {
  test('succesfully matches a cmpError', () => {
    const value: string|CmpError = cmpError('test error');
    expect(value).toBeCmpError();
  });

  // unskip these to make sure they cause failed tests

  test.skip('should fail for a non-CmpError value', () => {
    expect('abc').toBeCmpError();
  });

  test.skip('should fail for a CmpError, even if the message is empty', () => {
    expect(cmpError('')).toBeCmpError();
  });
});

describe('toBeCmpErrorWithMessage', () => {
  test('successfully matches a cmpError with expected message', () => {
    fc.assert(fc.property(fc.string(), (message) => {
      expect(cmpError(message)).toBeCmpErrorWithMessage(message);
    }));
  });

  // unskip these to make sure they cause failed tests

  test.skip(
      'should fail if the CmpError does not have the correct message', () => {
        expect(cmpError('wrong message')).toBeCmpErrorWithMessage('message');
      });

  test.skip('should fail if the result is not a CmpError', () => {
    expect(1).toBeCmpErrorWithMessage('message');
  });
});
