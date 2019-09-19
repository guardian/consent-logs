import {ConsentString} from 'consent-string';

import {CmpError, cmpError, collectCmpErrors, collectCmpErrors4, isCmpError} from './errors';
import {CmpRecordV1, CmpRecordV2, Source, sources, V1PurposeObj, v1Purposes, V2PurposeObj, v2Purposes, Version, versions} from './model';
import {assertUnreachable} from './utilities';


/* tslint:disable-next-line:no-any */
const validateBoolean = (value: any, label: string): boolean|CmpError => {
  if (typeof value === 'boolean') {
    return value;
  } else {
    return cmpError(`expected boolean for ${label}, got ${value}`);
  }
};

const validateStringKey =
    /* tslint:disable-next-line:no-any */
    (key: any, allowedKeys: string[], label: string): string|CmpError => {
      if (typeof key === 'string') {
        const valid = allowedKeys.includes(key);
        return valid ? key : cmpError(`invalid ${label}, ${key}`);
      } else {
        return cmpError(`${label} keys must be strings`);
      }
    };

const isNonEmpty = (value: string): boolean => value.trim().length > 0;

/* tslint:disable-next-line:no-any */
const validateSourceType = (source: any): Source|CmpError => {
  if (typeof source === 'string') {
    const valid = sources.includes(source);
    if (valid) {
      // cast is safe because we've checked this is a sourceType
      return source as Source;
    } else {
      return cmpError(
          `invalid sourceType, expected one of ${sources.join(', ')}`);
    }
  } else {
    return cmpError('expected string for source');
  }
};

/* tslint:disable-next-line:no-any */
const validateV1Purposes = (purposes: any): V1PurposeObj|CmpError => {
  if (typeof purposes === 'object') {
    const keys = Object.keys(purposes);
    const keysValidation = collectCmpErrors(
        keys.map((key) => validateStringKey(key, v1Purposes, 'purpose')));
    if (isCmpError(keysValidation)) {
      return keysValidation;
    } else {
      const allRequiredKeysPresent =
          v1Purposes.every((key) => keysValidation.includes(key));
      if (allRequiredKeysPresent) {
        const validatedValues = Object.entries(purposes).map(
            ([key, value]) => validateBoolean(value, key));
        const result = collectCmpErrors(validatedValues);
        if (isCmpError(result)) {
          return result;
        } else {
          return purposes as V1PurposeObj;
        }
      } else {
        return cmpError('missing required purpose');
      }
    }
  } else {
    return cmpError('object expected for purposes');
  }
};

/* tslint:disable-next-line:no-any */
const validateV2Purposes = (purposes: any): V2PurposeObj|CmpError => {
  if (typeof purposes === 'object') {
    const keys = Object.keys(purposes);
    const keysValidation = collectCmpErrors(
        keys.map((key) => validateStringKey(key, v2Purposes, 'purpose')));
    if (isCmpError(keysValidation)) {
      return keysValidation;
    } else {
      const allRequiredKeysPresent =
          v2Purposes.every((key) => keysValidation.includes(key));
      if (allRequiredKeysPresent) {
        const validatedValues = Object.entries(purposes).map(
            ([key, value]) => validateBoolean(value, key));
        const result = collectCmpErrors(validatedValues);
        if (isCmpError(result)) {
          return result;
        } else {
          return purposes as V2PurposeObj;
        }
      } else {
        return cmpError('missing required purpose');
      }
    }
  } else {
    return cmpError('object expected for purposes');
  }
};

const validateIabConsentString =
    /* tslint:disable-next-line:no-any */
    (base64ConsentString: any): string|CmpError => {
      if (typeof base64ConsentString === 'string') {
        if (base64ConsentString.length) {
          try {
            const consentString: ConsentString =
                new ConsentString(base64ConsentString);
            consentString.getVersion();
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
const validateVersion = (version: any): Version|CmpError => {
  if (typeof version === 'string') {
    if (versions.includes(version)) {
      return version as Version;
    } else {
      return cmpError(`${version} is not a valid version`);
    }
  } else {
    return cmpError('expected string for version');
  }
};

const validateObject =
    /* tslint:disable-next-line:no-any */
    (jsonObject: {[key: string]: any}): CmpError|CmpRecordV1|CmpRecordV2 => {
      const version = validateVersion(jsonObject.version);
      if (isCmpError(version)) {
        return version;
      } else {
        switch (version) {
          case '1':
            return validateV1Object(jsonObject);
          case '2':
            return validateV2Object(jsonObject);
          default:
            /* will not compile if there are versions that are not handled,
             * versions are defined and validated above.
             * Look out for error messages like 'not assignable to never'.
             */
            return assertUnreachable(version);
        }
      }
    };

const validateV1Object =
    /* tslint:disable-next-line:no-any */
    (jsonObject: {[key: string]: any}): CmpError|CmpRecordV1 => {
      const result = collectCmpErrors4(
          validateIabConsentString(jsonObject.iab),
          validateSourceType(jsonObject.source),
          validateV1Purposes(jsonObject.purposes),
          validateBrowserId(jsonObject.browserId));
      if (isCmpError(result)) {
        return result;
      } else {
        const [consentString, sourceType, purposes, browserId] = result;
        return {
          iab: consentString,
          version: '1',
          time: Date.now(),
          source: sourceType,
          purposes,
          browserId
        };
      }
    };

const validateV2Object =
    /* tslint:disable-next-line:no-any */
    (jsonObject: {[key: string]: any}): CmpError|CmpRecordV2 => {
      const result = collectCmpErrors4(
          validateIabConsentString(jsonObject.iab),
          validateSourceType(jsonObject.source),
          validateV2Purposes(jsonObject.purposes),
          validateBrowserId(jsonObject.browserId));
      if (isCmpError(result)) {
        return result;
      } else {
        const [consentString, sourceType, purposes, browserId] = result;
        return {
          iab: consentString,
          version: '2',
          time: Date.now(),
          source: sourceType,
          purposes,
          browserId
        };
      }
    };

const parseJson = (json: string): CmpRecordV1|CmpRecordV2|CmpError => {
  try {
    const parsedJson: object = JSON.parse(json);
    return validateObject(parsedJson);
  } catch (exception) {
    return cmpError('Error parsing submission body');
  }
};

export {validateObject, parseJson};

export let _ = {
  validateSourceType,
  validateV1Purposes,
  validateV2Purposes,
  validateIabConsentString,
  validateBrowserId,
  validateVersion,
  validateObject,
  validateStringKey,
  validateBoolean,
  isNonEmpty,
};
