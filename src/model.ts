import {ConsentString} from 'consent-string';

enum PurposeType {
  'essential',
  'performance',
  'functionality',
}
// See:
// https://www.typescriptlang.org/docs/handbook/enums.html#enums-at-compile-time
type PurposeString = keyof typeof PurposeType;

enum SourceType {
  'cmp-ui',
  'ios',
  'www',
  'support',
  'amp',
}
type SourceString = keyof typeof SourceType;

type PurposeList = {
  [key in PurposeString]: boolean
};

type CMPCookie = {
  iab: string,
  version: string,
  time: Date,
  source: SourceString,
  purposes: PurposeList,
  browserId: string
};

const acceptedVersions: string[] = ['1'];

const isNonEmpty = (value: string): boolean => value.trim().length > 0;
// IsNumber is used to access an enum as a string[]
const isNumber = (value: string|number): boolean =>
    isNonEmpty(value.toString()) && isNaN(Number(value)) === false;
const sourceTypes: string[] =
    Object.keys(SourceType).filter(source => !isNumber(source));
const purposeTypes: string[] =
    Object.keys(PurposeType).filter(purpose => !isNumber(purpose));

const isValidSourceType = (sourceType: string): boolean =>
    sourceTypes.includes(sourceType);
const isValidPurposeType = (purposeType: string): boolean =>
    purposeTypes.includes(purposeType);

const isValidConsentString = (base64ConsentString: string): boolean => {
  if (!base64ConsentString) {
    return false;
  }
  try {
    const consentString: ConsentString = new ConsentString(base64ConsentString);
    return !!consentString;
  } catch {
    return false;
  }
};

const isValidPurposes = (purposeList: PurposeList): boolean =>
    typeof purposeList === 'object' &&
    Object.keys(purposeList).every(isValidPurposeType) &&
    Object.values(purposeList).every(value => typeof value === 'boolean');

const isValidBrowserId = (browserId: string): boolean => isNonEmpty(browserId);

const isValidVersion = (version: string): boolean =>
    acceptedVersions.includes(version);

const isValidTime = (time: number): boolean =>
    typeof time === 'number' && isNumber(time);

const validateObject = (jsonObject: object): boolean => {
  const keysToCheck = {
    'iab': isValidConsentString,
    'version': isValidVersion,
    'time': isValidTime,
    'source': isValidSourceType,
    'purposes': isValidPurposes,
    'browserId': isValidBrowserId
  };
  return Object
      .keys(keysToCheck)
      // @ts-ignore: This is where we need to convert between types
      .every((key) => key in jsonObject && keysToCheck[key](jsonObject[key]));
};

const parseJson = (json: string): CMPCookie|null => {
  try {
    const parsedJson: object = JSON.parse(json);
    return validateObject(parsedJson) ? (parsedJson as CMPCookie) : null;
  } catch (exception) {
    return null;
  }
};

export {
  parseJson,
};

export let _ = {
  isNumber,
  isValidSourceType,
  isValidPurposeType,
  isValidConsentString,
  isValidPurposes,
  isValidBrowserId,
  sourceTypes,
  purposeTypes,
  isNonEmpty,
};