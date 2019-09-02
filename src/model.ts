import {ConsentString} from 'consent-string';
import {CmpError, cmpError} from './errors';

enum PurposeType {
  'essential',
  'performance',
  'functionality',
  'presonalisedAdvertising'
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
  time: number,
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

const isValidPurposes = (purposeList: PurposeList): boolean => {
  const keys = Object.keys(purposeList);
  // correct type,
  // all keys are valid purposes,
  // all purposes are present,
  // all keys are booleans
  return typeof purposeList === 'object' && keys.every(isValidPurposeType) &&
      purposeTypes.every((key) => keys.includes(key)) &&
      Object.values(purposeList).every(value => typeof value === 'boolean');
};

const isValidBrowserId = (browserId: string): boolean => isNonEmpty(browserId);

const isValidVersion = (version: string): boolean =>
    acceptedVersions.includes(version);

const isValidTime = (time: number): boolean =>
    typeof time === 'number' && isNumber(time);

const validateObject = (jsonObject: object): CmpError|CMPCookie => {
  const keysToCheck = {
    'iab': isValidConsentString,
    'version': isValidVersion,
    'time': isValidTime,
    'source': isValidSourceType,
    'purposes': isValidPurposes,
    'browserId': isValidBrowserId
  };
  const valid =
      Object.keys(keysToCheck)
          .every(
              // @ts-ignore: This is where we need to convert between types
              (key) => key in jsonObject && keysToCheck[key](jsonObject[key]));
  return valid ? (jsonObject as CMPCookie) :
                 cmpError('TODO, work out which key');
};

const parseJson = (json: string): CmpError|CMPCookie => {
  try {
    const parsedJson: object = JSON.parse(json);
    return validateObject(parsedJson);
  } catch (exception) {
    return cmpError('Error parsing submission body');
  }
};

export {parseJson, CMPCookie};

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