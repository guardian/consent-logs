
/* tslint:disable:no-any */
import fc from 'fast-check';

import {_, parseJson} from './model';

const {
  isNumber,
  isValidSourceType,
  isValidPurposeType,
  isValidConsentString,
  isValidPurposes,
  isValidBrowserId,
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
    purposes: [],
    browserId: 'abc123'
  };

  test('Should not parse an empty string', () => {
    expect(parseJson('')).toBeNull();
  });

  test('Should not parse an empty object in a string', () => {
    expect(parseJson('{}')).toBeNull();
  });

  test('Should parse an object with all keys', () => {
    expect(parseJson(JSON.stringify(validObject))).toMatchObject(validObject);
  });

  test('Should reject random objects', () => {
    fc.assert(
        fc.property(fc.json(), (jsonString: string) => !parseJson(jsonString)));
  });

  describe('iab key', () => {
    test('Should not accept invalid types', () => {
      const invalidType: fc.Arbitrary<any> =
          fc.anything().filter(anyValue => typeof anyValue !== 'string');
      fc.assert(fc.property(invalidType, (invalidType: any) => {
        const invalidObject =
            Object.assign({}, validObject, {iab: invalidType});
        expect(parseJson(JSON.stringify(invalidObject))).toBeNull();
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
        expect(parseJson(JSON.stringify(invalidObject))).toBeNull();
      }));
    });

    test('Should not accept invalid types', () => {
      const invalidType: fc.Arbitrary<any> =
          fc.anything().filter(anyValue => typeof anyValue !== 'string');
      fc.assert(fc.property(invalidType, (invalidType: any) => {
        const invalidObject =
            Object.assign({}, validObject, {version: invalidType});
        expect(parseJson(JSON.stringify(invalidObject))).toBeNull();
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
        expect(parseJson(JSON.stringify(invalidObject))).toBeNull();
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
        expect(parseJson(JSON.stringify(invalidObject))).toBeNull();
      }));
    });

    test('Should not accept invalid types', () => {
      const invalidType: fc.Arbitrary<any> =
          fc.anything().filter(anyValue => typeof anyValue !== 'string');
      fc.assert(fc.property(invalidType, (invalidType: any) => {
        const invalidObject =
            Object.assign({}, validObject, {source: invalidType});
        expect(parseJson(JSON.stringify(invalidObject))).toBeNull();
      }));
    });
  });

  describe('purposes key', () => {
    test('Should accept an empty object', () => {
      const newValidObject = Object.assign({}, validObject, {purposes: {}});
      expect(parseJson(JSON.stringify(newValidObject)))
          .toMatchObject(newValidObject);
    });

    test('Should accept valid purposes', () => {
      const validPurposeGen = fc.constantFrom(...purposeTypes);
      fc.assert(fc.property(
          validPurposeGen, fc.boolean(),
          (validPurpose: string, randomBoolean: boolean) => {
            const validObjectWithPurposes = Object.assign(
                {}, validObject, {purposes: {[validPurpose]: randomBoolean}});
            expect(parseJson(JSON.stringify(validObjectWithPurposes)))
                .toMatchObject(validObjectWithPurposes);
          }));
    });

    test('Should reject invalid purposes keys', () => {
      const invalidPurposeGen = fc.string().filter(
          randomString => !purposeTypes.includes(randomString));
      fc.assert(fc.property(
          invalidPurposeGen, fc.boolean(),
          (invalidPurpose: string, randomBoolean: boolean) => {
            const invalidObject = Object.assign(
                {}, validObject, {purposes: {invalidPurpose: randomBoolean}});
            expect(parseJson(JSON.stringify(invalidObject))).toBeNull();
          }));
    });

    test('Should not accept invalid types', () => {
      const invalidType: fc.Arbitrary<any> =
          fc.anything().filter(anyValue => typeof anyValue !== 'object');
      fc.assert(fc.property(invalidType, (invalidType: any) => {
        const invalidObject =
            Object.assign({}, validObject, {purposes: invalidType});
        expect(parseJson(JSON.stringify(invalidObject))).toBeNull();
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
            expect(parseJson(JSON.stringify(invalidObject))).toBeNull();
          }));
    });
  });

  describe('browserId key', () => {
    test('Should not acccept an empty string', () => {
      const newInvalidObject = Object.assign({}, validObject, {browserId: ''});
      expect(parseJson(JSON.stringify(newInvalidObject))).toBeNull();
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
        expect(parseJson(JSON.stringify(invalidObject))).toBeNull();
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

describe('isValidSourceType', () => {
  test('should only allow valid source types', () => {
    expect(sourceTypes.every(isValidSourceType)).toBe(true);
  });

  test('should not allow an empty string', () => {
    expect(isValidSourceType('')).toBe(false);
  });

  test('should not accept random strings', () => {
    fc.assert(fc.property(
        fc.string(),
        (randomString: string) => !isValidSourceType(randomString)));
  });
});

describe('isValidPurposeType', () => {
  test('should only allow valid purpose types', () => {
    expect(purposeTypes.every(isValidPurposeType)).toBe(true);
  });

  test('should not accept random strings', () => {
    fc.assert(fc.property(
        fc.string(),
        (randomString: string) => !isValidPurposeType(randomString)));
  });
});

describe('isValidConsentString', () => {
  // Consent string tool
  // http://gdpr-demo.labs.quantcast.com/user-examples/cookie-workshop.html
  test('Should accept consent strings', () => {
    const validConsentStrings = ['BOkhG-BOkhG-BAAABAENAAAAAAAAoAA'];
    validConsentStrings.forEach(
        consentString =>
            expect(isValidConsentString(consentString)).toBe(true));
  });

  test('Should not accept random strings', () => {
    fc.assert(fc.property(
        fc.unicodeString(),
        (randomUnicodeString: string) =>
            !isValidConsentString(randomUnicodeString)));
  });
});

describe('isValidPurposes', () => {
  const purposesArbitrary = fc.constantFrom(...purposeTypes);

  test('Should accept valid purposes', () => {
    const validPurposesListArbitrary = fc.object(new fc.ObjectConstraints(
        purposesArbitrary, [fc.boolean()], 0, 5, false, false));

    fc.assert(fc.property(
        validPurposesListArbitrary,
        (validPurposes) => isValidPurposes(validPurposes)));
  });

  test('Should not accept random strings in keys', () => {
    const invalidKeysPurposesListArbitrary =
        fc.object(new fc.ObjectConstraints(
                      fc.string(), [fc.boolean()], 1, 5, false, false))
            .filter(o => Object.keys(o).length > 0);

    fc.assert(fc.property(
        invalidKeysPurposesListArbitrary,
        (invalidPurposes) => !isValidPurposes(invalidPurposes)));
  });
});

describe('isValidBrowserId', () => {
  test('Should not accept an empty string', () => {
    expect(isValidBrowserId('')).toBe(false);
  });

  test('Should accept any non-empty string', () => {
    const nonEmptyString = fc.string(1, 40).filter(s => s.trim().length > 0);
    fc.assert(fc.property(
        nonEmptyString,
        (nonEmptyString: string) => isValidBrowserId(nonEmptyString)));
  });
});