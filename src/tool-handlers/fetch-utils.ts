/**
 * Shared network/security utilities for fetching remote resources.
 * Used by both image-utils and audio-utils to avoid duplication.
 */
import dns from 'node:dns/promises';

export function readEnvInt(name: string, fallback: number, min = 1): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n >= min ? n : fallback;
}

function ipv4ToUint(ip: string): number {
  const parts = ip.split('.').map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((p) => !Number.isInteger(p) || p < 0 || p > 255)) {
    throw new Error('Invalid IPv4');
  }
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

/** Blocks RFC1918, loopback, link-local, CGNAT, metadata. */
export function isBlockedIPv4(ip: string): boolean {
  const n = ipv4ToUint(ip);
  if (n >>> 24 === 127) return true;
  if (n >>> 24 === 10) return true;
  if (n >>> 20 === 0xac1) return true;
  if (n >>> 16 === 0xc0a8) return true;
  if (n >>> 16 === 0xa9fe) return true;
  if (n >>> 24 === 0) return true;
  if (n >= 0x64400000 && n <= 0x647fffff) return true;
  return false;
}

function isBlockedIPv6(ip: string): boolean {
  const raw = ip.includes('%') ? ip.split('%')[0]! : ip;
  const x = raw.toLowerCase();
  if (x === '::1') return true;
  if (x.startsWith('fe80:') || x.startsWith('fec0:')) return true;
  const first = x.split(':').find((p) => p.length > 0);
  if (first) {
    const v = parseInt(first, 16);
    if (!Number.isNaN(v) && v >= 0xfc00 && v <= 0xfdff) return true;
  }
  return false;
}

function isIPv4Literal(host: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
}

/** Resolve hostname and ensure the resolved address is not private/link-local. */
export async function assertUrlSafeForFetch(urlString: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    throw new Error('Invalid URL');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only HTTP(S) URLs are allowed');
  }
  if (url.username || url.password) {
    throw new Error('URL with credentials is not allowed');
  }

  const host = url.hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost')) {
    throw new Error('Blocked host');
  }

  if (isIPv4Literal(host)) {
    if (isBlockedIPv4(host)) throw new Error('Blocked host');
    return url;
  }

  if (host.includes(':') && !host.startsWith('[')) {
    if (isBlockedIPv6(host)) throw new Error('Blocked host');
    return url;
  }

  let lookupHost = host;
  if (host.startsWith('[') && host.endsWith(']')) {
    lookupHost = host.slice(1, -1);
    if (isBlockedIPv6(lookupHost)) throw new Error('Blocked host');
    return url;
  }

  const records = await dns.lookup(lookupHost, { all: true, verbatim: true });
  if (!records.length) throw new Error('Could not resolve host');

  for (const r of records) {
    const { address, family } = r;
    if (family === 4) {
      if (isBlockedIPv4(address)) throw new Error('Blocked host');
    } else if (family === 6) {
      if (isBlockedIPv6(address)) throw new Error('Blocked host');
    }
  }

  return url;
}

async function readResponseBodyWithLimit(res: Response, maxBytes: number): Promise<Buffer> {
  const reader = res.body?.getReader();
  if (!reader) {
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > maxBytes) throw new Error('Response too large');
    return buf;
  }
  const chunks: Buffer[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) throw new Error('Response too large');
    chunks.push(Buffer.from(value));
  }
  return Buffer.concat(chunks);
}

export interface FetchOptions {
  timeoutMs: number;
  maxBytes: number;
  maxRedirects: number;
}

/**
 * Fetch a remote HTTP(S) resource with SSRF protection, size limits,
 * redirect cap, and timeout. Returns body Buffer + Content-Type header.
 */
export async function fetchHttpResource(
  urlString: string,
  opts: FetchOptions,
): Promise<{ buffer: Buffer; contentType: string | null }> {
  let current = urlString;

  for (let hop = 0; hop <= opts.maxRedirects; hop++) {
    const validated = await assertUrlSafeForFetch(current);
    const target = validated.href;
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), opts.timeoutMs);
    let res: Response;
    try {
      res = await fetch(target, { redirect: 'manual', signal: controller.signal });
    } finally {
      clearTimeout(t);
    }

    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location');
      if (!loc) throw new Error('Redirect without Location header');
      current = new URL(loc, target).href;
      continue;
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = await readResponseBodyWithLimit(res, opts.maxBytes);
    return { buffer, contentType: res.headers.get('content-type') };
  }

  throw new Error('Too many redirects');
}
