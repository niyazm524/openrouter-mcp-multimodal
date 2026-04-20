import { describe, it, expect } from 'vitest';
import { _internals } from '../openrouter-api.js';

const { parseRetryAfter, backoffWithJitter } = _internals;

describe('parseRetryAfter', () => {
  it('returns null for missing header', () => {
    expect(parseRetryAfter(null)).toBeNull();
  });

  it('parses integer seconds', () => {
    expect(parseRetryAfter('5')).toBe(5000);
    expect(parseRetryAfter('0')).toBe(0);
  });

  it('parses HTTP-date into future milliseconds', () => {
    const future = new Date(Date.now() + 10_000).toUTCString();
    const ms = parseRetryAfter(future);
    expect(ms).not.toBeNull();
    expect(ms!).toBeGreaterThan(5000);
    expect(ms!).toBeLessThan(15000);
  });

  it('clamps past HTTP-date to zero', () => {
    const past = new Date(Date.now() - 60_000).toUTCString();
    expect(parseRetryAfter(past)).toBe(0);
  });

  it('returns null for unparseable values', () => {
    expect(parseRetryAfter('later please')).toBeNull();
  });
});

describe('backoffWithJitter', () => {
  it('honors Retry-After when it exceeds the base backoff', () => {
    const delays = Array.from({ length: 20 }, () => backoffWithJitter(0, 2000));
    // Base (400) < retry-after (2000), so every delay should be in the
    // jittered range around 2000ms (1000 .. 3000).
    for (const d of delays) {
      expect(d).toBeGreaterThanOrEqual(1000);
      expect(d).toBeLessThanOrEqual(3000);
    }
  });

  it('uses base backoff when Retry-After is null', () => {
    const delays = Array.from({ length: 20 }, () => backoffWithJitter(1, null));
    // Base for attempt=1 is 800ms; jittered 400..1200.
    for (const d of delays) {
      expect(d).toBeGreaterThanOrEqual(400);
      expect(d).toBeLessThanOrEqual(1200);
    }
  });

  it('clamps backoff to the 10-second ceiling', () => {
    const delays = Array.from({ length: 20 }, () => backoffWithJitter(0, 120_000));
    for (const d of delays) {
      expect(d).toBeLessThanOrEqual(15_000);
    }
  });
});
