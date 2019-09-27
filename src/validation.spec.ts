
/* tslint:disable:no-any */
import fc from 'fast-check';
import {advanceTo, clear as resetTime} from 'jest-date-mock';

import {addCmpExtensions} from './cmpErrorTestExtensions';
import {isCmpError} from './errors';
import {sources, v1Purposes, v2Purposes, versions} from './model';
import {_, parseJson} from './validation';

addCmpExtensions();
export const removeProperty =
    (propKey: any, {[propKey]: propValue, ...rest}: any) => rest;

const {
  validateSourceType,
  validateV1Purposes,
  validateV2Purposes,
  validateIabConsentString,
  validateBrowserId,
  validateVersion,
  validateOptionalString,
  validateStringKey,
  validateBoolean,
  isNonEmpty,
} = _;

describe('parseJson', () => {
  const validV1Object = {
    iab: 'BOkNAntOkNAntAAABAENAAAAAAAAoAA',
    version: '1',
    source: 'www',
    purposes: {'personalisedAdvertising': false},
    browserId: 'abc123-v1',
    variant: 'test'
  };
  const validV2Object = {
    iab: 'BOkNAntOkNAntAAABAENAAAAAAAAoAA',
    version: '2',
    source: 'www',
    purposes: {
      'essential': false,
      'performance': false,
      'functionality': false,
      'personalisedAdvertising': false
    },
    browserId: 'abc123-v2',
    variant: 'test'
  };

  test('Should not parse an empty string', () => {
    expect(parseJson('')).toBeCmpError();
  });

  test('Should not parse an empty object in a string', () => {
    expect(parseJson('{}')).toBeCmpError();
  });

  test('Should parse a v1 object with all keys', () => {
    expect(parseJson(JSON.stringify(validV1Object)))
        .toMatchObject(validV1Object);
  });

  test('Should parse a v2 object with all keys', () => {
    expect(parseJson(JSON.stringify(validV2Object)))
        .toMatchObject(validV2Object);
  });

  test('Should reject random objects', () => {
    fc.assert(fc.property(fc.json(), (jsonString: string) => {
      expect(parseJson(jsonString)).toBeCmpError();
    }));
  });

  describe('iab key', () => {
    test('correctly sets the IAB consent string', () => {
      const result = parseJson(JSON.stringify(validV1Object));
      if (isCmpError(result)) {
        fail(`Expected a valid CMP record, got an error, ${result.message}`);
      } else {
        expect(result.iab).toEqual(validV1Object.iab);
      }
    });

    test('rejects submissions with invalid IAB consent string', () => {
      const invalidObject =
          Object.assign({}, validV2Object, {iab: 'invalid IAB string'});
      expect(parseJson(JSON.stringify(invalidObject))).toBeCmpError();
    });

    test('iab is required', () => {
      const invalidObject = removeProperty('iab', validV2Object);
      expect(parseJson(JSON.stringify(invalidObject))).toBeCmpError();
    });
  });

  describe('version key', () => {
    test('correctly sets the version for a v1 object', () => {
      const result = parseJson(JSON.stringify(validV1Object));
      if (isCmpError(result)) {
        fail(`Expected a valid CMP record, got an error, ${result.message}`);
      } else {
        expect(result.version).toEqual('1');
      }
    });

    test('correctly sets the version for a v2 object', () => {
      const result = parseJson(JSON.stringify(validV2Object));
      if (isCmpError(result)) {
        fail(`Expected a valid CMP record, got an error, ${result.message}`);
      } else {
        expect(result.version).toEqual('2');
      }
    });

    test('version is required', () => {
      const invalidObject = removeProperty('version', validV2Object);
      expect(parseJson(JSON.stringify(invalidObject))).toBeCmpError();
    });
  });

  describe('time key', () => {
    const now = Date.now();
    beforeAll(() => {
      advanceTo(now);
    });

    afterAll(() => {
      resetTime();
    });

    test('should be set to the current server time', () => {
      const result = parseJson(JSON.stringify(validV2Object));
      if (isCmpError(result)) {
        fail(`Expected a valid CMP record, got an error, ${result.message}`);
      } else {
        expect(new Date(result.time).getTime()).toBe(now);
      }
    });
  });

  describe('source key', () => {
    test('Sets the correct source in the generated object', () => {
      sources.forEach(source => {
        const newValidObject = Object.assign({}, validV2Object, {source});
        const result = parseJson(JSON.stringify(newValidObject));
        if (isCmpError(result)) {
          fail(`expected valid sample object to parse correctly, ${
              result.message}`);
        } else {
          expect(result.source).toEqual(source);
        }
      });
    });

    test('Should not accept invalid source types', () => {
      const invalidSourceTypes = fc.string().filter(s => !sources.includes(s));
      fc.assert(fc.property(invalidSourceTypes, (invalidSourceType: string) => {
        const invalidObject =
            Object.assign({}, validV2Object, {source: invalidSourceType});
        expect(parseJson(JSON.stringify(invalidObject))).toBeCmpError();
      }));
    });

    test('source is required', () => {
      const invalidObject = removeProperty('source', validV2Object);
      expect(parseJson(JSON.stringify(invalidObject))).toBeCmpError();
    });
  });

  describe('purposes key', () => {
    test('Should accept valid v1 purposes', () => {
      const result = parseJson(JSON.stringify(validV1Object));
      if (isCmpError(result)) {
        fail(`expected valid sample object to parse correctly, '${
            result.message}'`);
      } else {
        expect(result.purposes).toEqual(validV1Object.purposes);
      }
    });

    test('v1 validation rejects submissions containing v2 purposes', () => {
      const invalidObject =
          Object.assign({}, validV1Object, {purposes: validV2Object.purposes});
      const result = parseJson(JSON.stringify(invalidObject));
      if (isCmpError(result)) {
        expect(result.message).toContain('purpose');
      } else {
        fail('v2 purposes in v1 object should not pass validation');
      }
    });

    test('Should accept valid v2 purposes', () => {
      const result = parseJson(JSON.stringify(validV2Object));
      if (isCmpError(result)) {
        fail(`expected valid sample object to parse correctly, '${
            result.message}'`);
      } else {
        expect(result.purposes).toEqual(validV2Object.purposes);
      }
    });

    test('v2 validation rejects submissions containing v1 purposes', () => {
      const invalidObject =
          Object.assign({}, validV2Object, {purposes: validV1Object.purposes});
      const result = parseJson(JSON.stringify(invalidObject));
      if (isCmpError(result)) {
        expect(result.message).toContain('purpose');
      } else {
        fail('v1 purposes in v2 object should not pass validation');
      }
    });

    test('purposes is required', () => {
      const invalidObject = removeProperty('purposes', validV2Object);
      expect(parseJson(JSON.stringify(invalidObject))).toBeCmpError();
    });
  });

  describe('browserId key', () => {
    test('Sets the correct browserId in the generated object', () => {
      const result = parseJson(JSON.stringify(validV1Object));
      if (isCmpError(result)) {
        fail(`Expected a valid CMP record, got an error, ${result.message}`);
      } else {
        expect(result.browserId).toEqual(validV1Object.browserId);
      }
    });

    test('Should not acccept an empty string', () => {
      const invalidObject = Object.assign({}, validV2Object, {browserId: ''});
      expect(parseJson(JSON.stringify(invalidObject))).toBeCmpError();
    });

    test('browserId is required', () => {
      const invalidObject = removeProperty('browserId', validV2Object);
      expect(parseJson(JSON.stringify(invalidObject))).toBeCmpError();
    });
  });

  describe('variant key', () => {
    test('Sets the correct variant in the generated object', () => {
      const result = parseJson(JSON.stringify(validV1Object));
      if (isCmpError(result)) {
        fail(`Expected a valid CMP record, got an error, ${result.message}`);
      } else {
        expect(result.variant).toEqual(validV1Object.variant);
      }
    });

    test('parsing succeeds when the variant is not present', () => {
      const v1ObjectWithoutVariant = removeProperty('variant', validV1Object);
      expect(parseJson(JSON.stringify(v1ObjectWithoutVariant)))
          .toNotBeCmpError();
    });
  });
});

describe('isNonEmpty', () => {
  test('Should be false for an empty string', () => {
    expect(isNonEmpty('')).toBe(false);
  });
  test('Should be true for all non empty strings', () => {
    const nonEmptyString = fc.string(1, 40).filter(s => s.trim().length > 0);
    fc.assert(fc.property(nonEmptyString, (nonEmptyRandomString: string) => {
      expect(isNonEmpty(nonEmptyRandomString)).toBe(true);
    }));
  });
});

describe('validateSourceType', () => {
  test('should only allow valid source types', () => {
    expect(sources.every(validateSourceType)).toNotBeCmpError();
  });

  test('should not allow an empty string', () => {
    expect(validateSourceType('')).toBeCmpError();
  });

  test('Should not accept invalid source types', () => {
    const invalidSourceTypes = fc.string().filter(s => !sources.includes(s));
    fc.assert(fc.property(invalidSourceTypes, (invalidSourceType: string) => {
      expect(validateSourceType(invalidSourceType)).toBeCmpError();
    }));
  });

  test('Should not accept invalid types', () => {
    const invalidType: fc.Arbitrary<any> =
        fc.anything().filter(anyValue => typeof anyValue !== 'string');
    fc.assert(fc.property(invalidType, (invalidType: any) => {
      expect(validateSourceType(invalidType)).toBeCmpError();
    }));
  });
});

describe('validateIabConsentString', () => {
  // Consent string tool
  // http://gdpr-demo.labs.quantcast.com/user-examples/cookie-workshop.html
  test('Should accept IAB consent strings', () => {
    const validConsentStrings = ['BOkhG-BOkhG-BAAABAENAAAAAAAAoAA'];
    validConsentStrings.forEach(
        consentString =>
            expect(validateIabConsentString(consentString)).toNotBeCmpError());
  });

  test('Should not accept random IAB consent strings', () => {
    fc.assert(fc.property(fc.unicodeString(), (randomUnicodeString: string) => {
      expect(validateIabConsentString(randomUnicodeString)).toBeCmpError();
    }));
  });

  test('should not accept an invalid type as its argument', () => {
    expect(validateIabConsentString(123)).toBeCmpError();
  });
});

describe('purpose validation', () => {
  const validV1Purposes = {'personalisedAdvertising': false};
  const validV2Purposes = {
    'essential': false,
    'performance': false,
    'functionality': false,
    'personalisedAdvertising': false
  };

  describe('validateV1Purposes', () => {
    const purposesArbitrary = fc.constantFrom(...v1Purposes);

    test('accepts valid purpose object', () => {
      expect(validateV1Purposes(validV1Purposes)).toEqual(validV1Purposes);
    });

    test('rejects a v2 purpose object', () => {
      expect(validateV1Purposes(validV2Purposes)).toBeCmpError();
    });

    test('Should not accept random strings in keys', () => {
      const invalidKeysPurposesListArbitrary =
          fc.object(new fc.ObjectConstraints(
                        fc.string(), [fc.boolean()], 1, 5, false, false))
              .filter(o => Object.keys(o).length > 0);
      fc.assert(
          fc.property(invalidKeysPurposesListArbitrary, (invalidPurposes) => {
            expect(validateV1Purposes(invalidPurposes)).toBeCmpError();
          }));
    });

    test('does not accept an object missing required purposes', () => {
      v1Purposes.forEach((purposeKey) => {
        const invalidPurposes = removeProperty(purposeKey, validV1Purposes);
        expect(validateV1Purposes(invalidPurposes)).toBeCmpError();
      });
    });

    test('fails with a helpful message for purpose value with wrong type', () => {
      const invalidPurposes =
          Object.assign({}, validV1Purposes, {'personalisedAdvertising': 123});
      const result = validateV1Purposes(invalidPurposes);
      if (isCmpError(result)) {
        expect(result.message).toContain('personalisedAdvertising');
      } else {
        fail(
            'call should have failed beacuse personalisedAdvertising has the wrong type');
      }
    });

    test('does not accept non-object types for the purposes', () => {
      const invalidType: fc.Arbitrary<any> =
          fc.anything().filter(anyValue => typeof anyValue !== 'object');
      fc.assert(fc.property(invalidType, (invalidType: any) => {
        expect(validateV1Purposes(invalidType)).toBeCmpError();
      }));
    });
  });

  describe('validateV2Purposes', () => {
    const purposesArbitrary = fc.constantFrom(...v2Purposes);

    test('accepts complete list of purposes', () => {
      expect(validateV2Purposes(validV2Purposes)).toEqual(validV2Purposes);
    });

    test('rejects a v1 purpose object', () => {
      expect(validateV2Purposes(validV1Purposes)).toBeCmpError();
    });

    test('Should not accept random strings in keys', () => {
      const invalidKeysPurposesListArbitrary =
          fc.object(new fc.ObjectConstraints(
                        fc.string(), [fc.boolean()], 1, 5, false, false))
              .filter(o => Object.keys(o).length > 0);
      fc.assert(
          fc.property(invalidKeysPurposesListArbitrary, (invalidPurposes) => {
            expect(validateV2Purposes(invalidPurposes)).toBeCmpError();
          }));
    });

    test('does not accept an object missing required purposes', () => {
      v2Purposes.forEach((purposeKey) => {
        const invalidPurposes = removeProperty(purposeKey, validV2Purposes);
        expect(validateV2Purposes(invalidPurposes)).toBeCmpError();
      });
    });

    test(
        'fails with a helpful message for purpose value with wrong type',
        () => {
          const invalidPurposes =
              Object.assign({}, validV2Purposes, {'essential': 123});
          const result = validateV2Purposes(invalidPurposes);
          if (isCmpError(result)) {
            expect(result.message).toContain('essential');
          } else {
            fail(
                'call should have failed beacuse essential has the wrong type');
          }
        });

    test('does not accept non-object types for the purposes', () => {
      const invalidType: fc.Arbitrary<any> =
          fc.anything().filter(anyValue => typeof anyValue !== 'object');
      fc.assert(fc.property(invalidType, (invalidType: any) => {
        expect(validateV2Purposes(invalidType)).toBeCmpError();
      }));
    });
  });
});

describe('validateBrowserId', () => {
  test('Should not accept an empty string', () => {
    expect(validateBrowserId('')).toBeCmpError();
  });

  test('Should accept any non-empty string', () => {
    const nonEmptyString = fc.string(1, 40).filter(s => s.trim().length > 0);
    fc.assert(fc.property(nonEmptyString, (nonEmptyString: string) => {
      expect(validateBrowserId(nonEmptyString)).toNotBeCmpError();
    }));
  });

  test('Should not accept invalid types', () => {
    const invalidType: fc.Arbitrary<any> =
        fc.anything().filter(anyValue => typeof anyValue !== 'string');
    fc.assert(fc.property(invalidType, (invalidType: any) => {
      expect(validateBrowserId(invalidType)).toBeCmpError();
    }));
  });
});

describe('validateVersion', () => {
  test('Should only accept valid verions', () => {
    versions.forEach(version => {
      expect(validateVersion(version)).toEqual(version);
    });
  });

  test('Should not accept invalid verions', () => {
    const invalidVersions = fc.string().filter(s => !versions.includes(s));
    fc.assert(fc.property(invalidVersions, (invalidVersion: string) => {
      expect(validateVersion(invalidVersion)).toBeCmpError();
    }));
  });

  test('Should not accept invalid types', () => {
    const invalidVersions: fc.Arbitrary<any> =
        fc.anything().filter(anyValue => typeof anyValue !== 'string');
    fc.assert(fc.property(invalidVersions, (invalidVersion: string) => {
      expect(validateVersion(invalidVersion)).toBeCmpError();
    }));
  });
});

describe('validateIabConsentString', () => {
  test('Should not accept invalid types', () => {
    const invalidType: fc.Arbitrary<any> =
        fc.anything().filter(anyValue => typeof anyValue !== 'string');
    fc.assert(fc.property(invalidType, (invalidType: any) => {
      expect(validateIabConsentString(invalidType)).toBeCmpError();
    }));
  });
});

describe('validateOptionalString', () => {
  test('accepts a non-empty string', () => {
    const nonEmptyStrings = fc.string().filter(s => s.length > 0);
    fc.assert(fc.property(nonEmptyStrings, (nonEmptyString) => {
      expect(validateOptionalString(nonEmptyString, 'test'))
          .toEqual(nonEmptyString);
    }));
  });

  test('accepts an object key that does not exist', () => {
    const obj: any = {};
    expect(validateOptionalString(obj.key, 'test')).toBeUndefined();
  });

  test('rejects an empty string', () => {
    expect(validateOptionalString('', 'test')).toBeCmpError();
  });

  test('Should not accept invalid types', () => {
    const invalidType: fc.Arbitrary<any> = fc.anything().filter(
        anyValue =>
            typeof anyValue !== 'string' && typeof anyValue !== 'undefined');
    fc.assert(fc.property(invalidType, (invalidType: any) => {
      expect(validateOptionalString(invalidType, 'test')).toBeCmpError();
    }));
  });
});

describe('validateStringKey', () => {
  const allowed = ['foo', 'bar'];

  test('succeeds for one of the allowed keys', () => {
    expect(validateStringKey('foo', allowed, 'test')).toEqual('foo');
  });

  test('fails for a value that is not in the allowed list', () => {
    expect(validateStringKey('baz', allowed, 'test')).toBeCmpError();
  });

  test('includes the provided label in the failure message', () => {
    const result = validateStringKey('baz', allowed, 'test');
    if (isCmpError(result)) {
      expect(result.message).toContain('test');
    } else {
      fail('Expected failure for a bad string key');
    }
  });
});

describe('validateBoolean', () => {
  test('succeeds for boolean values', () => {
    const booleans: fc.Arbitrary<boolean> = fc.boolean();
    fc.assert(fc.property(booleans, (bool) => {
      expect(validateBoolean(bool, 'test')).toEqual(bool);
    }));
  });

  test('fails if the provided type is not a boolean', () => {
    const invalidBooleans: fc.Arbitrary<any> =
        fc.anything().filter(anyValue => typeof anyValue !== 'boolean');
    fc.assert(fc.property(invalidBooleans, (invalidBoolean) => {
      expect(validateBoolean(invalidBoolean, 'test')).toBeCmpError();
    }));
  });

  test('failure message includes the provided label', () => {
    const strs = fc.string();
    fc.assert(fc.property(strs, (label) => {
      const result = validateBoolean(123, label);
      if (isCmpError(result)) {
        expect(result.message).toContain(label);
      } else {
        fail('expected failure with non-boolean argument');
      }
    }));
  });
});
