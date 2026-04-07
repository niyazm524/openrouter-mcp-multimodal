import { describe, it, expect } from 'vitest';
import { readEnvInt, isBlockedIPv4, assertUrlSafeForFetch } from '../tool-handlers/fetch-utils.js';

describe('readEnvInt', () => {
  it('returns fallback when env var is missing', () => {
    delete process.env['TEST_MISSING_VAR'];
    expect(readEnvInt('TEST_MISSING_VAR', 42)).toBe(42);
  });

  it('returns fallback when env var is empty', () => {
    process.env['TEST_EMPTY_VAR'] = '';
    expect(readEnvInt('TEST_EMPTY_VAR', 42)).toBe(42);
    delete process.env['TEST_EMPTY_VAR'];
  });

  it('parses valid integer', () => {
    process.env['TEST_INT_VAR'] = '100';
    expect(readEnvInt('TEST_INT_VAR', 42)).toBe(100);
    delete process.env['TEST_INT_VAR'];
  });

  it('returns fallback for non-numeric value', () => {
    process.env['TEST_NAN_VAR'] = 'abc';
    expect(readEnvInt('TEST_NAN_VAR', 42)).toBe(42);
    delete process.env['TEST_NAN_VAR'];
  });

  it('returns fallback when value is below min', () => {
    process.env['TEST_LOW_VAR'] = '0';
    expect(readEnvInt('TEST_LOW_VAR', 42, 1)).toBe(42);
    delete process.env['TEST_LOW_VAR'];
  });
});

describe('isBlockedIPv4', () => {
  it('blocks loopback', () => {
    expect(isBlockedIPv4('127.0.0.1')).toBe(true);
    expect(isBlockedIPv4('127.255.255.255')).toBe(true);
  });

  it('blocks RFC1918 10.x', () => {
    expect(isBlockedIPv4('10.0.0.1')).toBe(true);
    expect(isBlockedIPv4('10.255.255.255')).toBe(true);
  });

  it('blocks RFC1918 172.16-31.x', () => {
    expect(isBlockedIPv4('172.16.0.1')).toBe(true);
    expect(isBlockedIPv4('172.31.255.255')).toBe(true);
  });

  it('blocks RFC1918 192.168.x', () => {
    expect(isBlockedIPv4('192.168.0.1')).toBe(true);
    expect(isBlockedIPv4('192.168.255.255')).toBe(true);
  });

  it('blocks link-local 169.254.x', () => {
    expect(isBlockedIPv4('169.254.169.254')).toBe(true);
  });

  it('blocks CGNAT 100.64-127.x', () => {
    expect(isBlockedIPv4('100.64.0.1')).toBe(true);
    expect(isBlockedIPv4('100.127.255.255')).toBe(true);
  });

  it('allows public IPs', () => {
    expect(isBlockedIPv4('8.8.8.8')).toBe(false);
    expect(isBlockedIPv4('1.1.1.1')).toBe(false);
    expect(isBlockedIPv4('142.250.80.46')).toBe(false);
  });
});

describe('assertUrlSafeForFetch', () => {
  it('rejects localhost', async () => {
    await expect(assertUrlSafeForFetch('http://localhost/foo')).rejects.toThrow('Blocked host');
  });

  it('rejects private IPv4', async () => {
    await expect(assertUrlSafeForFetch('http://127.0.0.1/foo')).rejects.toThrow('Blocked host');
    await expect(assertUrlSafeForFetch('http://192.168.1.1/foo')).rejects.toThrow('Blocked host');
  });

  it('rejects non-HTTP protocols', async () => {
    await expect(assertUrlSafeForFetch('ftp://example.com/foo')).rejects.toThrow('Only HTTP(S)');
  });

  it('rejects URLs with credentials', async () => {
    await expect(assertUrlSafeForFetch('http://user:pass@example.com/foo')).rejects.toThrow(
      'credentials',
    );
  });

  it('rejects invalid URLs', async () => {
    await expect(assertUrlSafeForFetch('not-a-url')).rejects.toThrow('Invalid URL');
  });
});
