import prettyFormat from 'pretty-format';

import {isCmpError} from './errors';

const addCmpExtensions = () => {
  expect.extend({
    toBeCmpError(received) {
      if (isCmpError(received)) {
        if (received.message.length > 0) {
          return {
            message: () =>
                `expected ${prettyFormat(received)} to be a CmpError`,
            pass: true,
          };
        } else {
          return {
            message: () =>
                `expected a non-empty string for the CmpError error message, ${
                    prettyFormat(received)}`,
            pass: false,
          };
        }
      } else {
        return {
          message: () => `expected ${prettyFormat(received)} to be a CmpError`,
          pass: false,
        };
      }
    },
    toNotBeCmpError(received) {
      if (isCmpError(received)) {
        return {
          message: () =>
              `expected ${prettyFormat(received)} not to be a CmpError`,
          pass: false,
        };
      } else {
        return {
          message: () =>
              `expected ${prettyFormat(received)} not to be a CmpError`,
          pass: true,
        };
      }
    },
    toBeCmpErrorWithMessage(received, expected) {
      if (isCmpError(received)) {
        if (received.message === expected) {
          return {
            message: () =>
                `expected ${prettyFormat(received)} to be a CmpError message ${
                    prettyFormat(expected)}`,
            pass: true,
          };
        } else {
          return {
            message: () => `expected error message ${
                prettyFormat(
                    received.message)} to be ${prettyFormat(expected)}`,
            pass: false,
          };
        }
      } else {
        return {
          message: () => `expected ${
              prettyFormat(received)} to be a CmpError with message ${
              prettyFormat(expected)}`,
          pass: false,
        };
      }
    }
  });
};

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeCmpError(): R;
      toNotBeCmpError(): R;
      toBeCmpErrorWithMessage(message: string): R;
    }
  }
}

export {addCmpExtensions};