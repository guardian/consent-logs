import {ConsentString} from 'consent-string';

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
      },
    });

type AmpConsentBody = {
  consentInstanceId: string,
  ampUserId: string,
  consentState: boolean,
  consentStateValue: string,
};

const getConsentInstanceId = (consentInstanceId: string): undefined|string =>
    typeof consentInstanceId === 'string' && consentInstanceId ?
    consentInstanceId :
    undefined;

const getAmpUserId = (ampUserId: string): undefined|string =>
    typeof ampUserId === 'string' && ampUserId ? ampUserId : undefined;

const getConsentState = (consentState: boolean): undefined|boolean =>
    typeof consentState === 'boolean' && consentState ? consentState :
                                                        undefined;

const getConsentStateValue = (consentStateValue: string): undefined|string =>
    typeof consentStateValue === 'string' && consentStateValue ?
    consentStateValue :
    undefined;


const getAmpConsentBody = (body: string): undefined|AmpConsentBody => {
  try {
    const parsedJson = JSON.parse(body);

    const consentInstanceId =
        getConsentInstanceId(parsedJson.consentInstanceId);
    const ampUserId = getAmpUserId(parsedJson.ampUserId);
    const consentState = getConsentState(parsedJson.consentState);
    const consentStateValue =
        getConsentStateValue(parsedJson.consentStateValue);

    if (consentInstanceId && ampUserId && consentState && consentStateValue) {
      return {
        consentInstanceId,
        ampUserId,
        consentState,
        consentStateValue,
      };
    }

    console.log(`Error validating AMP body ${body}`);
    return undefined;
  } catch (e) {
    console.log(`Error validating AMP body ${e} ${body}`);
    return undefined;
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