import path from 'path';
import { promises as fs } from 'fs';
import {
  readEnvInt,
  isBlockedIPv4 as _isBlockedIPv4,
  assertUrlSafeForFetch as _assertUrlSafeForFetch,
  fetchHttpResource,
} from './fetch-utils.js';

// Re-export for backward compatibility (tests import from image-utils)
export const isBlockedIPv4 = _isBlockedIPv4;
export const assertUrlSafeForFetch = _assertUrlSafeForFetch;

const DEFAULT_MAX_DIMENSION = 800;
const DEFAULT_JPEG_QUALITY = 80;
const DEFAULT_FETCH_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_DOWNLOAD_BYTES = 25 * 1024 * 1024;
const DEFAULT_MAX_REDIRECTS = 8;
const DEFAULT_MAX_DATA_URL_BYTES = 20 * 1024 * 1024;

export function getMaxImageDimension(): number {
  return readEnvInt('OPENROUTER_IMAGE_MAX_DIMENSION', DEFAULT_MAX_DIMENSION, 64);
}

export function getImageJpegQuality(): number {
  return readEnvInt('OPENROUTER_IMAGE_JPEG_QUALITY', DEFAULT_JPEG_QUALITY, 1);
}

function getFetchTimeoutMs(): number {
  return readEnvInt('OPENROUTER_IMAGE_FETCH_TIMEOUT_MS', DEFAULT_FETCH_TIMEOUT_MS, 1000);
}

function getMaxDownloadBytes(): number {
  return readEnvInt('OPENROUTER_IMAGE_MAX_DOWNLOAD_BYTES', DEFAULT_MAX_DOWNLOAD_BYTES, 1024);
}

function getMaxRedirects(): number {
  return readEnvInt('OPENROUTER_IMAGE_MAX_REDIRECTS', DEFAULT_MAX_REDIRECTS, 0);
}

function getMaxDataUrlBytes(): number {
  return readEnvInt('OPENROUTER_IMAGE_MAX_DATA_URL_BYTES', DEFAULT_MAX_DATA_URL_BYTES, 1024);
}

let sharpFn: ((input: Buffer) => import('sharp').Sharp) | null = null;
let loaded = false;

async function loadSharp(): Promise<((input: Buffer) => import('sharp').Sharp) | null> {
  if (!loaded) {
    loaded = true;
    try {
      const mod = await import('sharp');
      const fn = (mod as unknown as { default?: (input: Buffer) => import('sharp').Sharp }).default;
      sharpFn = fn ?? (mod as unknown as (input: Buffer) => import('sharp').Sharp);
    } catch {
      console.error('sharp not available, images will be sent unprocessed');
    }
  }
  return sharpFn;
}

export function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const map: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
  };
  return map[ext] || 'image/jpeg';
}

export async function fetchHttpImage(urlString: string): Promise<Buffer> {
  const { buffer } = await fetchHttpResource(urlString, {
    timeoutMs: getFetchTimeoutMs(),
    maxBytes: getMaxDownloadBytes(),
    maxRedirects: getMaxRedirects(),
  });
  return buffer;
}

export async function fetchImage(source: string): Promise<Buffer> {
  if (source.startsWith('data:')) {
    const match = source.match(/^data:[^;]+;base64,(.+)$/);
    if (!match) throw new Error('Invalid data URL');
    const b64 = match[1];
    const approxBytes = Math.ceil((b64.length * 3) / 4);
    if (approxBytes > getMaxDataUrlBytes()) throw new Error('Data URL too large');
    return Buffer.from(b64, 'base64');
  }

  if (source.startsWith('http://') || source.startsWith('https://')) {
    return fetchHttpImage(source);
  }

  return fs.readFile(source);
}

export async function optimizeImage(buffer: Buffer): Promise<string> {
  const sharp = await loadSharp();
  if (!sharp) return buffer.toString('base64');

  const maxDim = getMaxImageDimension();
  const quality = getImageJpegQuality();

  try {
    const meta = await sharp(buffer).metadata();
    let pipeline = sharp(buffer);

    if (meta.width && meta.height && Math.max(meta.width, meta.height) > maxDim) {
      const opts = meta.width > meta.height ? { width: maxDim } : { height: maxDim };
      pipeline = pipeline.resize(opts);
    }

    const out = await pipeline.jpeg({ quality }).toBuffer();
    return out.toString('base64');
  } catch {
    return buffer.toString('base64');
  }
}

export async function prepareImageUrl(source: string): Promise<string> {
  if (source.startsWith('data:')) return source;

  const buffer = await fetchImage(source);
  const base64 = await optimizeImage(buffer);
  const mime = source.startsWith('http') ? 'image/jpeg' : getMimeType(source);
  return `data:${mime};base64,${base64}`;
}
