
/* tslint:disable:no-any */
import fc from 'fast-check';

import {addCmpExtensions} from './cmpErrorTestExtensions';
import {isCmpError} from './errors';
import {_, parseJson} from './model';

addCmpExtensions();

const {
  isNumber,
  validateSourceType,
  validatePurposeType,
  validateConsentString,
  validatePurposes,
  validateBrowserId,
  sourceTypes,
  purposeTypes,
  isNonEmpty
} = _;

describe('parseJson', () => {
  const validObject = {
    iab: 'BOkNAntOkNAntAAABAENAAAAAAAAoAA',
    version: '1',
    time: 123,
    source: 'www',
    purposes: {
      'essential': false,
      'performance': false,
      'functionality': false,
      'personalisedAdvertising': false
    },
    browserId: 'abc123'
  };

  test('Should not parse an empty string', () => {
    expect(parseJson('')).toBeCmpError();
  });

  test('Should not parse an empty object in a string', () => {
    expect(parseJson('{}')).toBeCmpError();
  });

  test('Should parse an object with all keys', () => {
    expect(parseJson(JSON.stringify(validObject))).toMatchObject(validObject);
  });

  test('Should reject random objects', () => {
    fc.assert(fc.property(fc.json(), (jsonString: string) => {
      expect(parseJson(jsonString)).toBeCmpError();
    }));
  });

  describe('iab key', () => {
    test('Should not accept invalid types', () => {
      const invalidType: fc.Arbitrary<any> =
          fc.anything().filter(anyValue => typeof anyValue !== 'string');
      fc.assert(fc.property(invalidType, (invalidType: any) => {
        const invalidObject =
            Object.assign({}, validObject, {iab: invalidType});
        expect(parseJson(JSON.stringify(invalidObject))).toBeCmpError();
      }));
    });
  });

  describe('version key', () => {
    const validVersions = ['1'];
    test('Should only accept valid verions', () => {
      validVersions.forEach(version => {
        const validObjectWithVersion =
            Object.assign({}, validObject, {version});
        expect(parseJson(JSON.stringify(validObjectWithVersion)))
            .toMatchObject(validObjectWithVersion);
      });
    });

    test('Should not accept invalid verions', () => {
      const invalidVersions =
          fc.string().filter(s => !validVersions.includes(s));
      fc.assert(fc.property(invalidVersions, (invalidVersion: string) => {
        const invalidObject =
            Object.assign({}, validObject, {version: invalidVersion});
        expect(parseJson(JSON.stringify(invalidObject))).toBeCmpError();
      }));
    });

    test('Should not accept invalid types', () => {
      const invalidType: fc.Arbitrary<any> =
          fc.anything().filter(anyValue => typeof anyValue !== 'string');
      fc.assert(fc.property(invalidType, (invalidType: any) => {
        const invalidObject =
            Object.assign({}, validObject, {version: invalidType});
        expect(parseJson(JSON.stringify(invalidObject))).toBeCmpError();
      }));
    });
  });

  describe('time key', () => {
    test('Should only accept valid values', () => {
      fc.assert(fc.property(fc.integer(), (randomInteger: number) => {
        const validObjectTime =
            Object.assign({}, validObject, {time: randomInteger});
        expect(parseJson(JSON.stringify(validObjectTime)))
            .toMatchObject(validObjectTime);
      }));
    });

    test('Should not accept invalid types', () => {
      const invalidType: fc.Arbitrary<any> =
          fc.anything().filter(anyValue => typeof anyValue !== 'number');
      fc.assert(fc.property(invalidType, (invalidType: any) => {
        const invalidObject =
            Object.assign({}, validObject, {time: invalidType});
        expect(parseJson(JSON.stringify(invalidObject))).toBeCmpError();
      }));
    });
  });

  describe('source key', () => {
    test('Should only accept valid source types', () => {
      sourceTypes.forEach(sourceType => {
        const newValidObject =
            Object.assign({}, validObject, {source: sourceType});
        expect(parseJson(JSON.stringify(newValidObject)))
            .toMatchObject(newValidObject);
      });
    });

    test('Should not accept invalid source types', () => {
      const invalidSourceTypes =
          fc.string().filter(s => !sourceTypes.includes(s));
      fc.assert(fc.property(invalidSourceTypes, (invalidSourceType: string) => {
        const invalidObject =
            Object.assign({}, validObject, {source: invalidSourceType});
        expect(parseJson(JSON.stringify(invalidObject))).toBeCmpError();
      }));
    });

    test('Should not accept invalid types', () => {
      const invalidType: fc.Arbitrary<any> =
          fc.anything().filter(anyValue => typeof anyValue !== 'string');
      fc.assert(fc.property(invalidType, (invalidType: any) => {
        const invalidObject =
            Object.assign({}, validObject, {source: invalidType});
        expect(parseJson(JSON.stringify(invalidObject))).toBeCmpError();
      }));
    });
  });

  describe('purposes key', () => {
    test('Should reject an empty purposes object', () => {
      const newValidObject = Object.assign({}, validObject, {purposes: {}});
      expect(parseJson(JSON.stringify(newValidObject))).toBeCmpError();
    });

    test('Should accept valid purposes', () => {
      expect(parseJson(JSON.stringify(validObject))).toEqual(validObject);
    });

    test('Should reject invalid purposes keys', () => {
      const invalidPurposeGen = fc.string().filter(
          randomString => !purposeTypes.includes(randomString));
      fc.assert(fc.property(
          invalidPurposeGen, fc.boolean(),
          (invalidPurpose: string, randomBoolean: boolean) => {
            const invalidObject = Object.assign(
                {}, validObject, {purposes: {invalidPurpose: randomBoolean}});
            expect(parseJson(JSON.stringify(invalidObject))).toBeCmpError();
          }));
    });

    test('Should not accept invalid types', () => {
      const invalidType: fc.Arbitrary<any> =
          fc.anything().filter(anyValue => typeof anyValue !== 'object');
      fc.assert(fc.property(invalidType, (invalidType: any) => {
        const invalidObject =
            Object.assign({}, validObject, {purposes: invalidType});
        expect(parseJson(JSON.stringify(invalidObject))).toBeCmpError();
      }));
    });

    test('Should not accept invalid types for the purposes values', () => {
      const validPurposeGen = fc.constantFrom(...purposeTypes);
      const invalidType: fc.Arbitrary<any> = fc.anything().filter(
          anyValue =>
              typeof anyValue !== 'boolean' && typeof anyValue !== 'undefined');
      fc.assert(fc.property(
          validPurposeGen, invalidType,
          (validPurposeKey: string, invalidType: any) => {
            const invalidObject = Object.assign(
                {}, validObject, {purposes: {[validPurposeKey]: invalidType}});
            expect(parseJson(JSON.stringify(invalidObject))).toBeCmpError();
          }));
    });

    test('rejects submissions with missing PECR purposes', () => {
      const removeProperty =
          (propKey: any, {[propKey]: propValue, ...rest}: any) => rest;

      purposeTypes.forEach((purposeKey) => {
        const invalidPurposes =
            removeProperty(purposeKey, validObject.purposes);
        const invalidObject =
            Object.assign({}, validObject, {purposes: invalidPurposes});
        expect(parseJson(JSON.stringify(invalidObject))).toBeCmpError();
      });
    });
  });

  describe('browserId key', () => {
    test('Should not acccept an empty string', () => {
      const newInvalidObject = Object.assign({}, validObject, {browserId: ''});
      expect(parseJson(JSON.stringify(newInvalidObject))).toBeCmpError();
    });
    test('Should accept any non-empty string', () => {
      const nonEmptyString = fc.string(1, 40).filter(s => s.trim().length > 0);
      fc.assert(fc.property(nonEmptyString, (nonEmptyRandomString: string) => {
        const validObjectWithBrowserId =
            Object.assign({}, validObject, {browserId: nonEmptyRandomString});
        expect(parseJson(JSON.stringify(validObjectWithBrowserId)))
            .toMatchObject(validObjectWithBrowserId);
      }));
    });

    test('Should not accept invalid types', () => {
      const invalidType: fc.Arbitrary<any> =
          fc.anything().filter(anyValue => typeof anyValue !== 'string');
      fc.assert(fc.property(invalidType, (invalidType: any) => {
        const invalidObject =
            Object.assign({}, validObject, {browserId: invalidType});
        expect(parseJson(JSON.stringify(invalidObject))).toBeCmpError();
      }));
    });
  });
});

describe('isNumber', () => {
  test('Should not accept an empty string', () => {
    expect(isNumber('')).toBe(false);
  });

  test('All string numbers should pass', () => {
    fc.assert(fc.property(
        fc.integer(),
        (randomNumber: number) => isNumber(randomNumber.toString())));
    fc.assert(fc.property(
        fc.float(),
        (randomNumber: number) => isNumber(randomNumber.toString())));
    fc.assert(fc.property(
        fc.bigInt(),
        (randomNumber: bigint) => isNumber(randomNumber.toString())));
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
    expect(sourceTypes.every(validateSourceType)).toNotBeCmpError();
  });

  test('should not allow an empty string', () => {
    expect(validateSourceType('')).toBeCmpError();
  });

  test('should not accept random strings', () => {
    fc.assert(fc.property(fc.string(), (randomString: string) => {
      expect(validateSourceType(randomString)).toBeCmpError();
    }));
  });
});

describe('validatePurposeType', () => {
  test('should only allow valid purpose types', () => {
    expect(
        purposeTypes.every((purposeType) => validatePurposeType(purposeType)))
        .toNotBeCmpError();
  });

  test('should not accept random strings', () => {
    fc.assert(fc.property(fc.string(), (randomString: string) => {
      expect(validatePurposeType(randomString)).toBeCmpError();
    }));
  });

  test('should not accept an invalid type as its argument', () => {
    expect(validatePurposeType(123)).toBeCmpError();
  });
});

describe('validateConsentString', () => {
  // Consent string tool
  // http://gdpr-demo.labs.quantcast.com/user-examples/cookie-workshop.html
  test('Should accept IAB consent strings', () => {
    const validConsentStrings = ['BOkhG-BOkhG-BAAABAENAAAAAAAAoAA'];
    validConsentStrings.forEach(
        consentString =>
            expect(validateConsentString(consentString)).toNotBeCmpError());
  });

  test('Should not accept random IAB consent strings', () => {
    fc.assert(fc.property(fc.unicodeString(), (randomUnicodeString: string) => {
      expect(validateConsentString(randomUnicodeString)).toBeCmpError();
    }));
  });

  test('should not accept an invalid type as its argument', () => {
    expect(validateConsentString(123)).toBeCmpError();
  });
});

describe('validatePurposes', () => {
  const validPurposes = {
    'essential': false,
    'performance': false,
    'functionality': false,
    'personalisedAdvertising': false
  };
  const purposesArbitrary = fc.constantFrom(...purposeTypes);

  test('accepts complete list of purposes', () => {
    expect(validatePurposes(validPurposes)).toEqual(validPurposes);
  });

  test('Should not accept random strings in keys', () => {
    const invalidKeysPurposesListArbitrary =
        fc.object(new fc.ObjectConstraints(
                      fc.string(), [fc.boolean()], 1, 5, false, false))
            .filter(o => Object.keys(o).length > 0);

    fc.assert(
        fc.property(invalidKeysPurposesListArbitrary, (invalidPurposes) => {
          expect(validatePurposes(invalidPurposes)).toBeCmpError();
        }));
  });

  test('does not accept an object missing required purposes', () => {
    const removeProperty =
        (propKey: any, {[propKey]: propValue, ...rest}: any) => rest;

    purposeTypes.forEach((purposeKey) => {
      const invalidPurposes = removeProperty(purposeKey, validPurposes);
      expect(validatePurposes(invalidPurposes)).toBeCmpError();
    });
  });

  test('fails with a helpful message for purpose with wrong type', () => {
    const invalidPurposes =
        Object.assign({}, validPurposes, {'essential': 123});
    const result = validatePurposes(invalidPurposes);
    if (isCmpError(result)) {
      expect(result.message).toContain('essential');
    } else {
      fail('call should have failed beacuse essential has the wrong type');
    }
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
});