import {ConsentString} from 'consent-string';
import {CmpError, cmpError, collectCmpErrors6, isCmpError} from './errors';

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

/* tslint:disable-next-line:no-any */
const validateSourceType = (sourceType: any): SourceString|CmpError => {
  if (typeof sourceType === 'string') {
    const valid = sourceTypes.includes(sourceType);
    // cast is safe because we've checked this is a sourceType
    return valid ? sourceType as SourceString : cmpError('invalid sourceType');
  } else {
    return cmpError('expected string for sourceType');
  }
};

/* tslint:disable-next-line:no-any */
const validatePurposeType = (purposeType: any): string|CmpError => {
  if (typeof purposeType === 'string') {
    const valid = purposeTypes.includes(purposeType);
    return valid ? purposeType : cmpError('invalid purposeType');
  } else {
    return cmpError('expected string for purpose key');
  }
};

/* tslint:disable-next-line:no-any */
const validateConsentString = (base64ConsentString: any): string|CmpError => {
  if (typeof base64ConsentString === 'string') {
    if (base64ConsentString.length) {
      try {
        const consentString: ConsentString =
            new ConsentString(base64ConsentString);
        return base64ConsentString;
      } catch {
        return cmpError(
            'provided iab value was not a valid TCF consent string');
      }
    } else {
      return cmpError('iab string cannot be empty');
    }
  } else {
    return cmpError('expected a string value for the iab field');
  }
};

const validatePurposes = (purposeList: PurposeList): PurposeList|CmpError => {
  const keys = Object.keys(purposeList);
  // correct type,
  // all keys are valid purposes,
  // all purposes are present,
  // all keys are booleans
  const valid = typeof purposeList === 'object' &&
      keys.every(validatePurposeType) &&
      purposeTypes.every((key) => keys.includes(key)) &&
      Object.values(purposeList).every(value => typeof value === 'boolean');
  // TODO: specify which purpose(s) caused the problem
  return valid ? purposeList : cmpError('invalid purpose(s)');
};

/* tslint:disable-next-line:no-any */
const validateBrowserId = (browserId: any): string|CmpError => {
  if (typeof browserId === 'string') {
    const valid = isNonEmpty(browserId);
    return valid ? browserId : cmpError('invalid browserID');
  } else {
    return cmpError('expected string for browserId');
  }
};

/* tslint:disable-next-line:no-any */
const validateVersion = (version: any): string|CmpError => {
  if (typeof version === 'string') {
    const valid = acceptedVersions.includes(version);
    return valid ? version : cmpError('invalid version');
  } else {
    return cmpError('expected string for version');
  }
};

/* tslint:disable-next-line:no-any */
const validateTime = (time: any): number|CmpError => {
  if (typeof time === 'number') {
    // TODO validate it is a valid time
    return time;
  } else {
    return cmpError('expected number for time');
  }
};

const validateObject =
    /* tslint:disable-next-line:no-any */
    (jsonObject: {[key: string]: any}): CmpError|CMPCookie => {
      const result = collectCmpErrors6(
          validateConsentString(jsonObject.iab),
          validateVersion(jsonObject.version), validateTime(jsonObject.time),
          validateSourceType(jsonObject.source),
          validatePurposes(jsonObject.purposes),
          validateBrowserId(jsonObject.browserId));
      if (isCmpError(result)) {
        return result;
      } else {
        const [consentString, version, time, sourceType, purposes, browserId] =
            result;
        return {
          iab: consentString,
          version,
          time,
          source: sourceType,
          purposes,
          browserId
        };
      }
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
  validateSourceType,
  validatePurposeType,
  validateConsentString,
  validatePurposes,
  validateBrowserId,
  sourceTypes,
  purposeTypes,
  isNonEmpty,
};
