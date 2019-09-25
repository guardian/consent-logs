/* tslint:disable:no-any */
import {ConsentString} from 'consent-string';
import fc from 'fast-check';
import {advanceTo, clear as resetTime} from 'jest-date-mock';

import {_ as _amp} from './amp';
import {addCmpExtensions} from './cmpErrorTestExtensions';
import VENDOR_LIST from './resources/vendorlist.json';
import {_ as _validation} from './validation';

addCmpExtensions();

const {
  ALL_ALLOWED_PURPOSES,
  fullConsent,
  noConsent,
  consentStringFromAmpConsent,
  consentModelFrom,
  getAmpConsentBody
} = _amp;

const {validateObject} = _validation;

const oneToTwentyFour = [
  1,  2,  3,  4,  5,  6,  7,  8,  9,  10, 11, 12,
  13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24
];

describe('All allowed IAB purposes', () => {
  test('Should always be equal to array of 1 to 24', () => {
    expect(ALL_ALLOWED_PURPOSES).toEqual(oneToTwentyFour);
  });
});

describe('Full Consent', () => {
  describe('created key', () => {
    const now = Date.now();
    beforeAll(() => {
      advanceTo(now);
    });

    afterAll(() => {
      resetTime();
    });

    test('Should contain the latest timestamp', () => {
      const consentObject = JSON.parse(JSON.stringify(fullConsent()));
      expect(new Date(consentObject.created).getTime()).toBe(now);
    });
  });

  describe('lastUpdated key', () => {
    const now = Date.now();
    beforeAll(() => {
      advanceTo(now);
    });

    afterAll(() => {
      resetTime();
    });

    test('Should contain the latest timestamp', () => {
      const consentObject = JSON.parse(JSON.stringify(fullConsent()));
      expect(new Date(consentObject.lastUpdated).getTime()).toBe(now);
    });
  });

  describe('version key', () => {
    test('Should contain the expected version', () => {
      const consentObject = JSON.parse(JSON.stringify(fullConsent()));
      expect(consentObject.version).toBe(1);
    });
  });

  describe('vendorList key', () => {
    test('Should be null', () => {
      const consentObject = JSON.parse(JSON.stringify(fullConsent()));
      // expect(consentObject.vendorList).toBeNull();
    });
  });

  describe('vendorListVersion key', () => {
    // This is null because we need the full vendor list to be used via
    // `setGlobalVendorList` in order to set it correctly
    test('Should be the same as the local version', () => {
      const consentObject = JSON.parse(JSON.stringify(fullConsent()));
      expect(consentObject.vendorListVersion)
          .toBe(VENDOR_LIST.vendorListVersion);
    });
  });

  describe('cmpId key', () => {
    test('Should be null', () => {
      const consentObject = JSON.parse(JSON.stringify(fullConsent()));
      expect(consentObject.cmpId).toBe(112);
    });
  });

  describe('consentScreen key', () => {
    test('Should be null', () => {
      const consentObject = JSON.parse(JSON.stringify(fullConsent()));
      expect(consentObject.consentScreen).toBe(1);
    });
  });

  describe('consentLanguage key', () => {
    test('Should be en', () => {
      const consentObject = JSON.parse(JSON.stringify(fullConsent()));
      expect(consentObject.consentLanguage).toBe('en');
    });
  });

  describe('allowedPurposeIds key', () => {
    test('Should be all allowed purposes 1 to 24', () => {
      const consentObject = JSON.parse(JSON.stringify(fullConsent()));
      expect(consentObject.allowedPurposeIds).toEqual(oneToTwentyFour);
    });
  });
});

describe('No Consent', () => {
  describe('created key', () => {
    const now = Date.now();
    beforeAll(() => {
      advanceTo(now);
    });

    afterAll(() => {
      resetTime();
    });

    test('Should contain the latest timestamp', () => {
      const consentObject = JSON.parse(JSON.stringify(noConsent()));
      expect(new Date(consentObject.created).getTime()).toBe(now);
    });
  });

  describe('lastUpdated key', () => {
    const now = Date.now();
    beforeAll(() => {
      advanceTo(now);
    });

    afterAll(() => {
      resetTime();
    });

    test('Should contain the latest timestamp', () => {
      const consentObject = JSON.parse(JSON.stringify(noConsent()));
      expect(new Date(consentObject.lastUpdated).getTime()).toBe(now);
    });
  });

  describe('version key', () => {
    test('Should contain the expected version', () => {
      const consentObject = JSON.parse(JSON.stringify(noConsent()));
      expect(consentObject.version).toBe(1);
    });
  });

  describe('vendorList key', () => {
    test('purposes should have all purposes from the vendor list', () => {
      const consentObject = JSON.parse(JSON.stringify(noConsent()));
      expect(consentObject.vendorList.purposes)
          .toMatchObject(VENDOR_LIST.purposes);
    });

    test('features should have all features from the vendor list', () => {
      const consentObject = JSON.parse(JSON.stringify(noConsent()));
      expect(consentObject.vendorList.features)
          .toMatchObject(VENDOR_LIST.features);
    });

    test('vendorListVersion should match version in the vendor list', () => {
      const consentObject = JSON.parse(JSON.stringify(noConsent()));
      expect(consentObject.vendorListVersion)
          .toEqual(VENDOR_LIST.vendorListVersion);
      expect(consentObject.vendorList.vendorListVersion)
          .toEqual(VENDOR_LIST.vendorListVersion);
    });
  });

  describe('vendorListVersion key', () => {
    // This is null because we need the full vendor list to be used via
    // `setGlobalVendorList` in order to set it correctly
    test('Should be the same as the local version', () => {
      const consentObject = JSON.parse(JSON.stringify(noConsent()));
      expect(consentObject.vendorListVersion)
          .toBe(VENDOR_LIST.vendorListVersion);
    });
  });

  describe('cmpId key', () => {
    test('Should be null', () => {
      const consentObject = JSON.parse(JSON.stringify(noConsent()));
      expect(consentObject.cmpId).toBe(112);
    });
  });

  describe('consentScreen key', () => {
    test('Should be null', () => {
      const consentObject = JSON.parse(JSON.stringify(noConsent()));
      expect(consentObject.consentScreen).toBe(1);
    });
  });

  describe('consentLanguage key', () => {
    test('Should be en', () => {
      const consentObject = JSON.parse(JSON.stringify(noConsent()));
      expect(consentObject.consentLanguage).toBe('en');
    });
  });

  describe('allowedPurposeIds key', () => {
    test('Should be all allowed purposes 1 to 24', () => {
      const consentObject = JSON.parse(JSON.stringify(noConsent()));
      expect(consentObject.allowedPurposeIds).toEqual([]);
    });
  });

  describe('allowedVendorIds key', () => {
    test('Should be empty', () => {
      const consentObject = JSON.parse(JSON.stringify(noConsent()));
      expect(consentObject.allowedVendorIds).toEqual([]);
    });
  });
});

describe('fullAmpConsent', () => {
  test('Should be the correct consent string for consent', () => {
    const base64ConsentString: string = consentStringFromAmpConsent(true);
    expect(base64ConsentString).toEqual(fullConsent().getConsentString());
  });

  test('Should be the correct consent string for no consent', () => {
    const base64ConsentString: string = consentStringFromAmpConsent(false);
    expect(base64ConsentString).toEqual(noConsent().getConsentString());
  });

  test(
      'Should be valid in the model',
      () => {

      });
});

describe('consentModelFrom', () => {
  describe('full consent', () => {
    test('Returns a valid CMP object', () => {
      const consentObject = consentModelFrom('abc', true);
      expect(validateObject(consentObject)).toNotBeCmpError();
    });

    test('Generated IAB consent string is valid', () => {
      const consentObject = consentModelFrom('abc', true);
      expect(() => new ConsentString(consentObject.iab)).not.toThrow();
    });

    test('creates a fully consented IAB string', () => {
      const consentObject = consentModelFrom('abc', true);
      const iabConsent = new ConsentString(consentObject.iab);
      const expected = ALL_ALLOWED_PURPOSES.map(id => [id, true]);
      expect(
          ALL_ALLOWED_PURPOSES.map(id => [id, iabConsent.isPurposeAllowed(id)]))
          .toEqual(expected);
    });

    describe('purposes', () => {
      test('should set personalisedAdvertising to true', () => {
        const consentObject = consentModelFrom('abc', true);
        expect(consentObject.purposes.personalisedAdvertising).toEqual(true);
      });

      // V1 schema does not include PECR purposes, these will be useful for v2

      // test('should set essential to true', () => {
      //   const consentObject = consentModelFrom('abc', true);
      //   expect(consentObject.purposes.essential).toEqual(true);
      // });

      // test('should set performance to true', () => {
      //   const consentObject = consentModelFrom('abc', true);
      //   expect(consentObject.purposes.performance).toEqual(true);
      // });

      // test('should set functionality to true', () => {
      //   const consentObject = consentModelFrom('abc', true);
      //   expect(consentObject.purposes.functionality).toEqual(true);
      // });
    });
  });

  describe('without consent', () => {
    test('Returns a valid CMP object', () => {
      const consentObject = consentModelFrom('abc', false);
      expect(validateObject(consentObject)).toNotBeCmpError();
    });

    describe('creates a fully non-consented IAB string', () => {
      const consentObject = consentModelFrom('abc', false);
      const iabConsent = new ConsentString(consentObject.iab);
      const expected = ALL_ALLOWED_PURPOSES.map(id => [id, false]);
      expect(
          ALL_ALLOWED_PURPOSES.map(id => [id, iabConsent.isPurposeAllowed(id)]))
          .toEqual(expected);
    });

    test('uses the provided amp user ID as the browser ID', () => {
      const consentObject = consentModelFrom('abc', false);
      expect(consentObject.browserId).toEqual('abc');
    });

    describe('purposes', () => {
      test('should set personalisedAdvertising to false', () => {
        const consentObject = consentModelFrom('abc', false);
        expect(consentObject.purposes.personalisedAdvertising).toEqual(false);
      });

      // V1 schema does not include PECR purposes, these will be useful for v2

      // test('should set essential to false', () => {
      //   const consentObject = consentModelFrom('abc', false);
      //   expect(consentObject.purposes.essential).toEqual(false);
      // });

      // test('should set performance to false', () => {
      //   const consentObject = consentModelFrom('abc', false);
      //   expect(consentObject.purposes.performance).toEqual(false);
      // });

      // test('should set functionality to false', () => {
      //   const consentObject = consentModelFrom('abc', false);
      //   expect(consentObject.purposes.functionality).toEqual(false);
      // });
    });
  });
});

describe('getAmpConsentBody', () => {
  const validBody: any = {
    consentInstanceId: 'adconsent',
    ampUserId: 'amp-nAH1sW6gGTVwm1PKfHmznA',
    consentState: true,
    consentStateValue: 'accepted'
  };

  test('Should return the amp body when it is invalid', () => {
    expect(getAmpConsentBody(JSON.stringify(validBody))).toEqual(validBody);
  });

  test('Should return undefined for any missing fields', () => {
    Object.keys(validBody).forEach(key => {
      const invalidBody = Object.assign({}, validBody, {[key]: undefined});
      // Stringify will remove any keys with a value of undefined
      expect(getAmpConsentBody(JSON.stringify(invalidBody))).toBeCmpError();
    });
  });

  test(
      'Should return undefined for any wrong field types that are expecting a string',
      () => {
        const nonStringType: fc.Arbitrary<any> =
            fc.anything().filter(anyValue => typeof anyValue !== 'string');

        ['consentInstanceId', 'ampUserId', 'consentStateValue'].forEach(key => {
          fc.assert(fc.property(nonStringType, (randomType: any) => {
            const invalidBody =
                Object.assign({}, validBody, {[key]: randomType});
            expect(getAmpConsentBody(JSON.stringify(invalidBody)))
                .toBeCmpError();
          }));
        });
      });

  test(
      'Should return undefined for any wrong field types that are expecting a string',
      () => {
        const nonStringType: fc.Arbitrary<any> =
            fc.anything().filter(anyValue => typeof anyValue !== 'boolean');

        fc.assert(fc.property(nonStringType, (randomType: any) => {
          const invalidBody =
              Object.assign({}, validBody, {consentState: randomType});
          expect(getAmpConsentBody(JSON.stringify(invalidBody))).toBeCmpError();
        }));
      });
});
