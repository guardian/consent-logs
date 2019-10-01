import {URL} from 'url';


const getHostname = (url: string): string => {
  const parsedUrl = new URL(url);
  return parsedUrl.hostname;
};

const hostnameMatches = (hostname: string, whitelistEntry: string): boolean => {
  if (whitelistEntry.length <= 0) {
    throw new Error('Empty entry in CORS domain whitelist is not allowed');
  } else if (whitelistEntry.charAt(0) === '.') {
    // wildcard matching
    return hostname.endsWith(whitelistEntry) ||
        hostname === whitelistEntry.substr(1);
  } else {
    // literal matching
    return hostname === whitelistEntry;
  }
};

// check this url's hostname against all whitelisted domains
const checkHostname = (url: string, whitelist: string[]): boolean => {
  const hostname = getHostname(url);
  return whitelist.some(
      whitelistEntry => hostnameMatches(hostname, whitelistEntry));
};

export const parseCorsWhitelist = (whitelistStr: string): string[] => {
  return whitelistStr.split(',').filter(entry => entry.length > 0);
};

export const corsCheck =
    (url: string, whitelist: string[]): CorsHeaders|undefined => {
      if (checkHostname(url, whitelist)) {
        return {
          origin: url,
          methods: 'POST, GET, OPTIONS',
          headers: 'Content-Type, Origin, Accept',
        };
      } else {
        return undefined;
      }
    };

export interface CorsHeaders {
  origin: string;
  headers: string;
  methods: string;
}

export let _ = {
  getHostname,
  hostnameMatches,
  checkHostname
};
