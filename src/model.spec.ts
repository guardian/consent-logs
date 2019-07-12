import fc from 'fast-check';
import { parseJson, _ } from './model';

const {
    IsNumber,
    isValidSourceType,
    isValidPurposeType,
    isValidConsentString,
    isValidPurposes,
    isValidBrowserId
 } = _;

 describe('parseJson', () => {
    test('Should not parse an empty string', () => {
        expect(parseJson('')).toBeNull();
    });

    test('Should parse an object with all keys', () => {
        const validObject = {iab: "test", version: "1", time: 123};
        expect(parseJson(JSON.stringify(validObject))).toMatchObject(validObject);
    });

    test('Should reject random objects', () => {
        fc.assert(fc.property(fc.json(), (jsonString: string) => !parseJson(jsonString)));
    });
});

describe('isNumber', () => {
    test('All string numbers should pass', () => {
        fc.assert(fc.property(fc.integer(), (randomNumber: number) => !IsNumber(randomNumber.toString())));
        fc.assert(fc.property(fc.float(), (randomNumber: number) => !IsNumber(randomNumber.toString())));
        fc.assert(fc.property(fc.bigInt(), (randomNumber: bigint) => !IsNumber(randomNumber.toString())));
    });
});

describe('isValidSourceType', () => {
    test('should only allow valid source types', () => {
        const sourceTypes: string[] = ["cmp-ui", "ios", "www", "support"];
        expect(sourceTypes.every(isValidSourceType)).toBe(true);
    });

    test('should not accept random strings', () => {
        fc.assert(fc.property(fc.string(), (randomString: string) => !isValidSourceType(randomString)));
    });
});

describe('isValidPurposeType', () => {
    test('should only allow valid purpose types', () => {
        const purposeTypes = ["essential", "performance", "functionality", "personaliseaAds"];
        expect(purposeTypes.every(isValidPurposeType)).toBe(true);
    });

    test('should not accept random strings', () => {
        fc.assert(fc.property(fc.string(), (randomString: string) => !isValidPurposeType(randomString)));
    });
});

describe('isValidConsentString', () => {
    test('Should not accept random strings', () => {
        fc.assert(fc.property(fc.unicodeString(), (randomUnicodeString: string) => !isValidConsentString(randomUnicodeString)));
    });
});

describe('isValidPurposes', () => {
    const purposesArbitrary = fc.constantFrom("essential", "performance", "functionality", "personaliseaAds");

    test('Should accept valid purposes', () => {
        const validPurposesListArbitrary =
            fc.object(new fc.ObjectConstraints(purposesArbitrary, [fc.boolean()], 0, 5, false, false));

        fc.assert(fc.property(validPurposesListArbitrary, (validPurposes) => isValidPurposes(validPurposes)));
    });

    test('Should not accept random strings in keys', () => {
        const invalidKeysPurposesListArbitrary =
            fc.object(new fc.ObjectConstraints(fc.string(), [fc.boolean()], 1, 5, false, false))
                .filter(o => Object.keys(o).length > 0);

        fc.assert(fc.property(invalidKeysPurposesListArbitrary, (invalidPurposes) => !isValidPurposes(invalidPurposes)));
    });

    test('Should not accept other types in values', () => {
        const invalidValuesPurposesListArbitrary =
            fc.object(new fc.ObjectConstraints(purposesArbitrary, [fc.string(), fc.integer()], 1, 5, false, false))
                .filter(o => Object.keys(o).length > 0);

        fc.assert(fc.property(invalidValuesPurposesListArbitrary, (invalidPurposes) => !isValidPurposes(invalidPurposes)));
    });
});

describe('isValidBrowserId', () => {
    test('Should not accept an empty string', () => {
        expect(isValidBrowserId("")).toBe(false);
    });

    test('Should accept any non-empty string', () => {
        const nonEmptyString = fc.string(1, 40).filter(s => s.trim().length > 0)
        fc.assert(fc.property(nonEmptyString, (nonEmptyString: string) => isValidBrowserId(nonEmptyString)));
    });
});