import { ConsentString } from 'consent-string';

enum PurposeType {
    "essential",
    "performance",
    "functionality",
    "personaliseaAds"
}
// See: https://www.typescriptlang.org/docs/handbook/enums.html#enums-at-compile-time
type PurposeString = keyof typeof PurposeType

enum SourceType {
    "cmp-ui",
    "ios",
    "www",
    "support"
}
type SourceString = keyof typeof SourceType

type PurposeList = { [key in PurposeString]: boolean }

type CMPCookie = {
    iab: string,
    version: string,
    time: Date,
    source: SourceString,
    purposes: PurposeList,
    browserId: String
}

// IsNumber is used to access an enum as a string[]
const IsNumber = (value: string): boolean => isNaN(Number(value)) !== false;
const SourceTypes: string[] = Object.keys(SourceType).filter(IsNumber);
const PurposeTypes: string[] = Object.keys(PurposeType).filter(IsNumber);

const isValidSourceType = (sourceType: string): boolean => SourceTypes.includes(sourceType);
const isValidPurposeType = (purposeType: string): boolean => PurposeTypes.includes(purposeType);

const isValidConsentString = (base64ConsentString: string): boolean => {
    if(!base64ConsentString) {
        return false;
    }
    try {
        const consentString: ConsentString = new ConsentString(base64ConsentString)
        return !!consentString;
    }
    catch {
        return false;
    }
}

const isValidPurposes = (purposeList: PurposeList): boolean =>
    Object.keys(purposeList).every(isValidPurposeType) &&
    Object.values(purposeList).every(value => typeof value === 'boolean')

const isValidBrowserId = (browserId: string): boolean => browserId.trim().length > 0;

const validateObject = (jsonObject: object): boolean => {
    let keysToCheck: string[] = ["iab", "version", "time"];
    return keysToCheck.every((key) => key in jsonObject)
 }

const parseJson = (json: string): CMPCookie | null => {
    try{
        let parsedJson: object = JSON.parse(json);
        return validateObject(parsedJson) ? (parsedJson as CMPCookie) : null;
    } catch (exception) {
        return null;
    }
}

export {
    parseJson,
};

export let _ = {
    IsNumber,
    isValidSourceType,
    isValidPurposeType,
    isValidConsentString,
    isValidPurposes,
    isValidBrowserId
};