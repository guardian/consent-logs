/* tslint:disable:no-any */
import {ConsentString} from 'consent-string';
import fc from 'fast-check';
import {advanceTo, clear} from 'jest-date-mock';

import {_} from './amp';
import {parseJson} from './model';
import VENDOR_LIST from './resources/vendorlist.json';

const {
  ALL_ALLOWED_PURPOSES,
  fullConsent,
  noConsent,
  consentStringFromAmpConsent,
  consentModelFrom,
  getAmpConsentBody
} = _;

const oneToTwentyFour = [
  1,  2,  3,  4,  5,  6,  7,  8,  9,  10, 11, 12,
  13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24
];

describe('All allowed purposes', () => {
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
      clear();
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
      clear();
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
      clear();
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
      clear();
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
  test('Should validate for a true consent', () => {
    const fullConsent = consentModelFrom('abc', true);
    expect(parseJson(JSON.stringify(fullConsent))).toEqual(fullConsent);
  });

  test('Should validate for a false consent', () => {
    const noConsent = consentModelFrom('abc', false);
    expect(parseJson(JSON.stringify(noConsent))).toEqual(noConsent);
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
      expect(getAmpConsentBody(JSON.stringify(invalidBody))).toEqual(undefined);
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
                .toEqual(undefined);
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
          expect(getAmpConsentBody(JSON.stringify(invalidBody)))
              .toEqual(undefined);
        }));
      });
});