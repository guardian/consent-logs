import {ConsentString} from 'consent-string';

import {cmpError, CmpError, collectCmpErrors4, isCmpError} from './errors';
import {CMPCookie} from './model';
import VENDOR_LIST from './resources/vendorlist.json';

const ALL_ALLOWED_PURPOSES: number[] = [
  1,  2,  3,  4,  5,  6,  7,  8,  9,  10, 11, 12,
  13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24
];
const GUARDIAN_CMP_ID = 112;
const CONSENT_LANGUAGE = 'en';

const fullConsent = (): ConsentString => {
  const consentString: ConsentString = new ConsentString();
  consentString.setPurposesAllowed(ALL_ALLOWED_PURPOSES);
  consentString.setCmpId(GUARDIAN_CMP_ID);
  consentString.setConsentLanguage(CONSENT_LANGUAGE);
  consentString.setConsentScreen(1);
  consentString.setGlobalVendorList(VENDOR_LIST);
  return consentString;
};

const noConsent = (): ConsentString => {
  const consentString: ConsentString = new ConsentString();
  consentString.setCmpId(GUARDIAN_CMP_ID);
  consentString.setConsentLanguage(CONSENT_LANGUAGE);
  consentString.setConsentScreen(1);
  consentString.setGlobalVendorList(VENDOR_LIST);
  return consentString;
};

const consentStringFromAmpConsent = (consent: boolean): string =>
    consent ? fullConsent().getConsentString() : noConsent().getConsentString();


const consentModelFrom = (ampUserId: string, ampConsent: boolean): CMPCookie =>
    ({
      iab: consentStringFromAmpConsent(ampConsent),
      source: 'amp',
      version: '1',
      time: Date.now(),
      browserId: ampUserId,
      purposes: {
        'essential': ampConsent,
        'performance': ampConsent,
        'functionality': ampConsent,
        'personalisedAdvertising': ampConsent,
      },
    });

type AmpConsentBody = {
  consentInstanceId: string,
  ampUserId: string,
  consentState: boolean,
  consentStateValue: string,
};

const getConsentInstanceId = (consentInstanceId: string): CmpError|string =>
    typeof consentInstanceId === 'string' && consentInstanceId ?
    consentInstanceId :
    cmpError('ConsentInstanceId should be a string');

const getAmpUserId = (ampUserId: string): CmpError|string =>
    typeof ampUserId === 'string' && ampUserId ?
    ampUserId :
    cmpError('ampUserId should be a string');

const getConsentState = (consentState: boolean): CmpError|boolean =>
    typeof consentState === 'boolean' ?
    consentState :
    cmpError('consentState should be a string');

const getConsentStateValue = (consentStateValue: string): CmpError|string =>
    typeof consentStateValue === 'string' && consentStateValue ?
    consentStateValue :
    cmpError('consentStateValue should be a string');

const getAmpConsentBody = (body: string): CmpError|AmpConsentBody => {
  try {
    const parsedJson = JSON.parse(body);

    const consentInstanceId: CmpError|string =
        getConsentInstanceId(parsedJson.consentInstanceId);
    const ampUserId: CmpError|string = getAmpUserId(parsedJson.ampUserId);
    const consentState: CmpError|boolean =
        getConsentState(parsedJson.consentState);
    const consentStateValue: CmpError|string =
        getConsentStateValue(parsedJson.consentStateValue);

    const attempt = collectCmpErrors4(
        consentInstanceId, ampUserId, consentState, consentStateValue);

    if (isCmpError(attempt)) {
      return attempt;
    } else {
      const [cII, aUI, cS, cSV] = attempt;
      return {
        consentInstanceId: cII,
        ampUserId: aUI,
        consentState: cS,
        consentStateValue: cSV,
      };
    }
  } catch (e) {
    console.log(`Error validating AMP body ${e} ${body}`);
    return cmpError('Error validating body');
  }
};

export {getAmpConsentBody, consentModelFrom, AmpConsentBody};

export let _ = {
  ALL_ALLOWED_PURPOSES,
  fullConsent,
  noConsent,
  consentStringFromAmpConsent,
  consentModelFrom,
  getAmpConsentBody
};