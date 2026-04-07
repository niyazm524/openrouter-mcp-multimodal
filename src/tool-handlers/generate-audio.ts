import { promises as fs } from 'fs';
import { dirname, extname } from 'path';
import OpenAI from 'openai';

export interface GenerateAudioToolRequest {
  prompt: string;
  model?: string;
  voice?: string;
  format?: string;
  save_path?: string;
}

const DEFAULT_MODEL = 'openai/gpt-audio';
const DEFAULT_VOICE = 'alloy';
const DEFAULT_FORMAT = 'pcm16';

const VALID_FORMATS = ['wav', 'mp3', 'flac', 'opus', 'pcm16'] as const;
type OutputFormat = (typeof VALID_FORMATS)[number];

const PCM_SAMPLE_RATE = 24000;
const PCM_BITS_PER_SAMPLE = 16;
const PCM_NUM_CHANNELS = 1;

/** Create a 44-byte WAV header for raw PCM16 data. */
export function createWavHeader(dataLength: number, sampleRate = PCM_SAMPLE_RATE): Buffer {
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * PCM_NUM_CHANNELS * (PCM_BITS_PER_SAMPLE / 8);
  const blockAlign = PCM_NUM_CHANNELS * (PCM_BITS_PER_SAMPLE / 8);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataLength, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(PCM_NUM_CHANNELS, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(PCM_BITS_PER_SAMPLE, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataLength, 40);

  return header;
}

/**
 * Detect audio container format from magic bytes.
 * Uses subarray (not deprecated slice). Tighter MP3 frame sync validation.
 */
export function detectAudioFormat(data: Buffer): { ext: string; mimeType: string } {
  if (data.length >= 3) {
    if (data[0] === 0x49 && data[1] === 0x44 && data[2] === 0x33) {
      return { ext: 'mp3', mimeType: 'audio/mpeg' };
    }
    if (data[0] === 0xff && (data[1]! & 0xe0) === 0xe0) {
      const versionBits = (data[1]! >> 3) & 0x03;
      if (versionBits !== 0x01) {
        return { ext: 'mp3', mimeType: 'audio/mpeg' };
      }
    }
  }
  if (data.length >= 12) {
    const riff = data.subarray(0, 4).toString('ascii');
    const wave = data.subarray(8, 12).toString('ascii');
    if (riff === 'RIFF' && wave === 'WAVE') {
      return { ext: 'wav', mimeType: 'audio/wav' };
    }
  }
  if (data.length >= 4) {
    const magic = data.subarray(0, 4).toString('ascii');
    if (magic === 'fLaC') return { ext: 'flac', mimeType: 'audio/flac' };
    if (magic === 'OggS') return { ext: 'ogg', mimeType: 'audio/ogg' };
  }
  return { ext: 'pcm', mimeType: 'audio/pcm' };
}

export function wrapPcmInWav(pcmData: Buffer): Buffer {
  return Buffer.concat([createWavHeader(pcmData.length), pcmData]);
}

/** Strip existing extension (if any) and append a new one. */
export function replaceExtension(filePath: string, newExt: string): string {
  const current = extname(filePath);
  const base = current ? filePath.slice(0, -current.length) : filePath;
  return `${base}.${newExt}`;
}

export async function handleGenerateAudio(
  request: { params: { arguments: GenerateAudioToolRequest } },
  openai: OpenAI,
) {
  const { prompt, model, voice, format, save_path } = request.params.arguments;

  if (!prompt?.trim()) {
    return { content: [{ type: 'text', text: 'Prompt is required.' }], isError: true };
  }

  const selectedFormat: OutputFormat = (VALID_FORMATS as readonly string[]).includes(format ?? '')
    ? (format as OutputFormat)
    : DEFAULT_FORMAT;
  const selectedVoice = voice?.trim() || DEFAULT_VOICE;

  try {
    const stream = await openai.chat.completions.create({
      model: model || DEFAULT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      modalities: ['text', 'audio'],
      audio: { voice: selectedVoice, format: selectedFormat },
      stream: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const audioChunks: string[] = [];
    const transcriptChunks: string[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for await (const chunk of stream as any) {
      const delta = chunk.choices?.[0]?.delta;
      if (delta?.audio) {
        if (delta.audio.data) audioChunks.push(delta.audio.data);
        if (delta.audio.transcript) transcriptChunks.push(delta.audio.transcript);
      }
    }

    const fullAudioBase64 = audioChunks.join('');
    const transcript = transcriptChunks.join('');

    if (!fullAudioBase64) {
      return { content: [{ type: 'text', text: transcript || 'No audio generated.' }] };
    }

    let audioBuffer = Buffer.from(fullAudioBase64, 'base64');
    const detected = detectAudioFormat(audioBuffer);

    // Always wrap raw PCM in WAV so it's playable
    if (detected.ext === 'pcm') {
      audioBuffer = wrapPcmInWav(audioBuffer);
      detected.ext = 'wav';
      detected.mimeType = 'audio/wav';
    }

    const returnBase64 = audioBuffer.toString('base64');

    if (save_path) {
      const dir = dirname(save_path);
      await fs.mkdir(dir, { recursive: true });

      const fileExt = extname(save_path).toLowerCase().slice(1);
      const actualSavePath =
        fileExt === detected.ext ? save_path : replaceExtension(save_path, detected.ext);

      await fs.writeFile(actualSavePath, audioBuffer);

      const formatNote =
        actualSavePath !== save_path
          ? ` (detected ${detected.ext.toUpperCase()}, saved as ${actualSavePath})`
          : '';
      const result = transcript
        ? `Audio saved to: ${actualSavePath}${formatNote}\nTranscript: ${transcript}`
        : `Audio saved to: ${actualSavePath}${formatNote}`;

      return {
        content: [
          { type: 'text', text: result },
          { type: 'audio', mimeType: detected.mimeType, data: returnBase64 },
        ],
      };
    }

    return {
      content: [
        { type: 'text', text: transcript || 'Audio generated successfully.' },
        { type: 'audio', mimeType: detected.mimeType, data: returnBase64 },
      ],
    };
  } catch (error: unknown) {
    let msg: string;
    if (error instanceof Error) {
      msg = error.message;
      const oaiErr = error as Error & { status?: number; error?: { message?: string } };
      if (oaiErr.error?.message) msg = `${msg} - ${oaiErr.error.message}`;
    } else {
      msg = String(error);
    }
    return { content: [{ type: 'text', text: `Error: ${msg}` }], isError: true };
  }
}
