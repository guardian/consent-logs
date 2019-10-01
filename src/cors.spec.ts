import {URL} from 'url';

import {_, corsCheck, parseCorsWhitelist} from './cors';

const {getHostname, hostnameMatches} = _;

describe('corsCheck', () => {
  const whitelist = ['.example.com', 'localhost'];

  test('echoes the url for a valid subdomain match', () => {
    const url = 'https://test.example.com/abc';
    const result = corsCheck(url, whitelist);
    if (result) {
      expect(result.origin).toEqual(url);
    } else {
      fail('expected CORS headers object from whitelisted URL');
    }
  });

  test('echoes the url for a valid exact match', () => {
    const url = 'http://localhost/abc';
    const result = corsCheck(url, whitelist);
    if (result) {
      expect(result.origin).toEqual(url);
    } else {
      fail('expected CORS headers object from whitelisted URL');
    }
  });

  test('returns undefined for a non-whitelisted url', () => {
    const result = corsCheck('http://foo.com/abc', whitelist);
    expect(result).toBeUndefined();
  });
});

describe('getHostname', () => {
  test('extracts the hostname from a URL', () => {
    expect(getHostname('https://example.com')).toEqual('example.com');
  });

  test('extracts the hostname from a locahost URL', () => {
    expect(getHostname('http://localhost')).toEqual('localhost');
  });

  test('extracts the hostname from a locahost URL with port', () => {
    expect(getHostname('http://localhost:8000')).toEqual('localhost');
  });

  test('extracts the hostname from a locahost URL with port, path etc', () => {
    expect(getHostname('http://localhost:8000/test?abc#123'))
        .toEqual('localhost');
  });

  test('extracts the hostname from a raw IP address URL', () => {
    expect(getHostname('http://10.0.0.1:8000/test?abc#123'))
        .toEqual('10.0.0.1');
  });
});

describe('hostnameMatches', () => {
  describe('for literal host whitelist', () => {
    test('matches localhost', () => {
      expect(hostnameMatches('localhost', 'localhost')).toBeTruthy();
    });

    test('matches proper domain', () => {
      expect(hostnameMatches('test.example.com', 'test.example.com'))
          .toBeTruthy();
    });

    test('does not match subdomain of literal whitelist entry', () => {
      expect(hostnameMatches('test.example.com', 'example.com')).toBeFalsy();
    });

    test('does not match apex of literal subdomain whitelist entry', () => {
      expect(hostnameMatches('example.com', 'test.example.com')).toBeFalsy();
    });

    test('does not match different domain', () => {
      expect(hostnameMatches('foo.com', 'example.com')).toBeFalsy();
    });

    test('does not match similar domain', () => {
      expect(hostnameMatches('foo-example.com', 'example.com')).toBeFalsy();
    });

    test('matches literal IP', () => {
      expect(hostnameMatches('192.168.0.1', '192.168.0.1')).toBeTruthy();
    });

    test('does not matche different IP', () => {
      expect(hostnameMatches('192.168.0.10', '192.168.0.1')).toBeFalsy();
    });
  });

  describe('for .-prefixed wildcard whitelist entry', () => {
    describe('apex matching', () => {
      test('matches apex of wild localhost', () => {
        expect(hostnameMatches('localhost', '.localhost')).toBeTruthy();
      });

      test('matches apex of wild proper domain', () => {
        expect(hostnameMatches('example.com', '.example.com')).toBeTruthy();
      });

      test('matches apex of wild proper subdomain', () => {
        expect(hostnameMatches('test.example.com', '.test.example.com'))
            .toBeTruthy();
      });
    });

    describe('subdomain matching', () => {
      test('matches subdomain of wild localhost', () => {
        expect(hostnameMatches('sub.localhost', '.localhost')).toBeTruthy();
      });

      test('matches subdomain of wild proper domain', () => {
        expect(hostnameMatches('sub.example.com', '.example.com')).toBeTruthy();
      });

      test('matches subdomain of wild proper subdomain', () => {
        expect(hostnameMatches('sub.test.example.com', '.test.example.com'))
            .toBeTruthy();
      });

      test('matches nested subdomains of wild whitelist entry', () => {
        expect(hostnameMatches('sub.test.example.com', '.example.com'))
            .toBeTruthy();
      });
    });

    describe('superdomain matching', () => {
      test('fails to match superdomain of wild proper domain', () => {
        expect(hostnameMatches('localhost', '.example.localhost')).toBeFalsy();
      });

      test('fails to match superdomain of wild subdomain entry', () => {
        expect(hostnameMatches('example.com', '.test.example.com')).toBeFalsy();
      });
    });

    describe('mismatched hosts', () => {
      test('does not match different domain', () => {
        expect(hostnameMatches('foo.com', '.example.com')).toBeFalsy();
      });

      test('does not match different subdomain on a different domain', () => {
        expect(hostnameMatches('test.foo.com', '.example.com')).toBeFalsy();
      });

      test('does not match similar domain that shares a prefix', () => {
        expect(hostnameMatches('example.com.au', '.example.com')).toBeFalsy();
      });

      test('does not match similar (sub)domain that shares a prefix', () => {
        expect(hostnameMatches('foo.example.com.au', '.example.com'))
            .toBeFalsy();
      });

      test('does not match different domain that shares a suffix', () => {
        expect(hostnameMatches('foo-example.com', '.example.com')).toBeFalsy();
      });
    });
  });
});

describe('parseCorsWhitelist', () => {
  test('parses the example CORS whitelist', () => {
    const result = parseCorsWhitelist('localhost,.example.com');
    expect(result).toEqual(['localhost', '.example.com']);
  });

  test('parses a single entry CORS whitelist', () => {
    const result = parseCorsWhitelist('localhost');
    expect(result).toEqual(['localhost']);
  });

  test('strips empty records', () => {
    const result = parseCorsWhitelist('localhost,.example.com,');
    expect(result).toEqual(['localhost', '.example.com']);
  });
});
