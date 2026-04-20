import { describe, it, expect, vi } from 'vitest';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { writeFileSync, unlinkSync } from 'node:fs';
import { handleAnalyzeVideo } from '../tool-handlers/analyze-video.js';
import type OpenAI from 'openai';

function mkMp4(): string {
  const file = path.join(tmpdir(), `mcp-analyze-video-${Date.now()}.mp4`);
  const contents = Buffer.concat([
    Buffer.from([0x00, 0x00, 0x00, 0x20]),
    Buffer.from('ftyp', 'ascii'),
    Buffer.from('isom', 'ascii'),
    Buffer.alloc(32),
  ]);
  writeFileSync(file, contents);
  return file;
}

function mockOpenAI(responseText: string) {
  const create = vi.fn().mockResolvedValue({
    choices: [{ message: { content: responseText } }],
    usage: { prompt_tokens: 100, completion_tokens: 20, total_tokens: 120 },
  });
  const openai = { chat: { completions: { create } } } as unknown as OpenAI;
  return { openai, create };
}

describe('handleAnalyzeVideo', () => {
  it('returns an INVALID_INPUT error when video_path is missing', async () => {
    const { openai } = mockOpenAI('ignored');
    const r = await handleAnalyzeVideo(
      { params: { arguments: { video_path: '' } } },
      openai,
    );
    expect(r.isError).toBe(true);
    expect((r as { _meta: { code: string } })._meta.code).toBe('INVALID_INPUT');
  });

  it('sends a video_url content part with base64 payload', async () => {
    const file = mkMp4();
    try {
      const { openai, create } = mockOpenAI('A short test clip.');
      const r = await handleAnalyzeVideo(
        { params: { arguments: { video_path: file, question: 'What is this?' } } },
        openai,
      );
      expect(r.isError).toBeFalsy();
      expect(create).toHaveBeenCalledOnce();
      const call = create.mock.calls[0]![0];
      const content = call.messages[0].content;
      expect(Array.isArray(content)).toBe(true);
      const videoPart = content[1];
      expect(videoPart.type).toBe('video_url');
      expect(videoPart.video_url.url.startsWith('data:video/mp4;base64,')).toBe(true);
    } finally {
      unlinkSync(file);
    }
  });

  it('uses OPENROUTER_DEFAULT_VIDEO_MODEL when set', async () => {
    vi.stubEnv('OPENROUTER_DEFAULT_VIDEO_MODEL', 'custom/video-model');
    const file = mkMp4();
    try {
      const { openai, create } = mockOpenAI('ok');
      await handleAnalyzeVideo(
        { params: { arguments: { video_path: file } } },
        openai,
      );
      const call = create.mock.calls[0]![0];
      expect(call.model).toBe('custom/video-model');
    } finally {
      unlinkSync(file);
      vi.unstubAllEnvs();
    }
  });

  it('falls back to google/gemini-2.5-flash when nothing is set', async () => {
    const file = mkMp4();
    try {
      const { openai, create } = mockOpenAI('ok');
      await handleAnalyzeVideo({ params: { arguments: { video_path: file } } }, openai);
      const call = create.mock.calls[0]![0];
      expect(call.model).toBe('google/gemini-2.5-flash');
    } finally {
      unlinkSync(file);
    }
  });

  it('attaches usage metadata', async () => {
    const file = mkMp4();
    try {
      const { openai } = mockOpenAI('Hi');
      const r = await handleAnalyzeVideo(
        { params: { arguments: { video_path: file } } },
        openai,
      );
      expect((r as { _meta?: { usage?: unknown } })._meta?.usage).toEqual({
        prompt_tokens: 100,
        completion_tokens: 20,
        total_tokens: 120,
      });
    } finally {
      unlinkSync(file);
    }
  });

  it('maps SSRF blocks to UPSTREAM_REFUSED', async () => {
    const { openai } = mockOpenAI('never called');
    const r = await handleAnalyzeVideo(
      { params: { arguments: { video_path: 'http://127.0.0.1/clip.mp4' } } },
      openai,
    );
    expect(r.isError).toBe(true);
    expect((r as { _meta: { code: string } })._meta.code).toBe('UPSTREAM_REFUSED');
  });

  it('maps unsupported formats to UNSUPPORTED_FORMAT', async () => {
    const file = path.join(tmpdir(), `bad-${Date.now()}.avi`);
    writeFileSync(file, Buffer.from('not-a-video'));
    try {
      const { openai } = mockOpenAI('never called');
      const r = await handleAnalyzeVideo(
        { params: { arguments: { video_path: file } } },
        openai,
      );
      expect(r.isError).toBe(true);
      expect((r as { _meta: { code: string } })._meta.code).toBe('UNSUPPORTED_FORMAT');
    } finally {
      unlinkSync(file);
    }
  });
});
