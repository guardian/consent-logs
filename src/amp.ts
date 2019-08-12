import { ConsentString } from 'consent-string';
import VENDOR_LIST from './resources/vendorlist.json';
import { CMPCookie } from './model'

const ALL_ALLOWED_PURPOSES: Array<number> = Array.from(Array(24).keys()).map(number => number + 1);
const GUARDIAN_CMP_ID: number = 112;
const CONSENT_LANGUAGE: string = 'en';

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


const consentModelFrom = (ampUserId: string, ampConsent: boolean): CMPCookie => ({
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

export {
    consentStringFromAmpConsent
};

export let _ = {
    ALL_ALLOWED_PURPOSES,
    fullConsent,
    noConsent,
    consentStringFromAmpConsent,
    consentModelFrom
};