import { describe, it, expect } from 'vitest';
import {
  createWavHeader,
  detectAudioFormat,
  wrapPcmInWav,
  replaceExtension,
} from '../tool-handlers/generate-audio.js';

describe('createWavHeader', () => {
  it('produces a 44-byte buffer', () => {
    const header = createWavHeader(1000);
    expect(header.length).toBe(44);
  });

  it('starts with RIFF...WAVE', () => {
    const header = createWavHeader(1000);
    expect(header.subarray(0, 4).toString('ascii')).toBe('RIFF');
    expect(header.subarray(8, 12).toString('ascii')).toBe('WAVE');
  });

  it('has correct file size field (36 + dataLength)', () => {
    const header = createWavHeader(1000);
    expect(header.readUInt32LE(4)).toBe(36 + 1000);
  });

  it('has PCM format (1)', () => {
    const header = createWavHeader(1000);
    expect(header.readUInt16LE(20)).toBe(1);
  });

  it('has correct data chunk size', () => {
    const header = createWavHeader(2048);
    expect(header.readUInt32LE(40)).toBe(2048);
  });
});

describe('detectAudioFormat', () => {
  it('detects MP3 with ID3 tag', () => {
    const buf = Buffer.from([0x49, 0x44, 0x33, 0x00, 0x00]);
    expect(detectAudioFormat(buf)).toEqual({ ext: 'mp3', mimeType: 'audio/mpeg' });
  });

  it('detects MP3 frame sync (MPEG1 Layer3 = 0xFF 0xFB)', () => {
    const buf = Buffer.from([0xff, 0xfb, 0x90, 0x00]);
    expect(detectAudioFormat(buf)).toEqual({ ext: 'mp3', mimeType: 'audio/mpeg' });
  });

  it('rejects reserved MP3 version bits (0x01)', () => {
    // 0xFF 0xE8 → version bits = (0xE8 >> 3) & 0x03 = 0x01 (reserved)
    const buf = Buffer.from([0xff, 0xe8, 0x00, 0x00]);
    expect(detectAudioFormat(buf).ext).not.toBe('mp3');
  });

  it('detects WAV (RIFF...WAVE)', () => {
    const buf = Buffer.alloc(12);
    buf.write('RIFF', 0);
    buf.writeUInt32LE(100, 4);
    buf.write('WAVE', 8);
    expect(detectAudioFormat(buf)).toEqual({ ext: 'wav', mimeType: 'audio/wav' });
  });

  it('detects FLAC', () => {
    const buf = Buffer.from('fLaC\x00\x00', 'ascii');
    expect(detectAudioFormat(buf)).toEqual({ ext: 'flac', mimeType: 'audio/flac' });
  });

  it('detects OGG', () => {
    const buf = Buffer.from('OggS\x00\x00', 'ascii');
    expect(detectAudioFormat(buf)).toEqual({ ext: 'ogg', mimeType: 'audio/ogg' });
  });

  it('defaults to pcm for unknown data', () => {
    const buf = Buffer.from([0x00, 0x01, 0x02, 0x03]);
    expect(detectAudioFormat(buf)).toEqual({ ext: 'pcm', mimeType: 'audio/pcm' });
  });

  it('defaults to pcm for empty buffer', () => {
    expect(detectAudioFormat(Buffer.alloc(0)).ext).toBe('pcm');
  });
});

describe('wrapPcmInWav', () => {
  it('prepends 44-byte WAV header', () => {
    const pcm = Buffer.from([0x00, 0x01, 0x02, 0x03]);
    const wav = wrapPcmInWav(pcm);
    expect(wav.length).toBe(44 + 4);
    expect(wav.subarray(0, 4).toString('ascii')).toBe('RIFF');
    expect(wav.subarray(8, 12).toString('ascii')).toBe('WAVE');
  });

  it('detected as WAV after wrapping', () => {
    const pcm = Buffer.alloc(100);
    const wav = wrapPcmInWav(pcm);
    expect(detectAudioFormat(wav)).toEqual({ ext: 'wav', mimeType: 'audio/wav' });
  });
});

describe('replaceExtension', () => {
  it('replaces existing extension', () => {
    expect(replaceExtension('output.wav', 'mp3')).toBe('output.mp3');
  });

  it('appends extension when none exists', () => {
    expect(replaceExtension('output', 'wav')).toBe('output.wav');
  });

  it('handles nested paths', () => {
    expect(replaceExtension('/tmp/audio/file.wav', 'mp3')).toBe('/tmp/audio/file.mp3');
  });

  it('handles dotfiles', () => {
    expect(replaceExtension('.hidden.wav', 'mp3')).toBe('.hidden.mp3');
  });
});
