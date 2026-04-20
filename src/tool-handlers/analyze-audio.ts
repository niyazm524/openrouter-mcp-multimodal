import OpenAI from 'openai';
import type {
  ChatCompletion,
  ChatCompletionMessageParam,
} from 'openai/resources/chat/completions.js';
import { prepareAudioData } from './audio-utils.js';
import { ErrorCode, toolError, toolErrorFrom } from '../errors.js';
import { classifyUpstreamError } from './openrouter-errors.js';
import {
  extractCompletionText,
  detectReasoningCutoff,
  toUsageMeta,
} from './completion-utils.js';

const DEFAULT_MODEL = 'google/gemini-2.5-flash';

export interface AnalyzeAudioToolRequest {
  audio_path: string;
  question?: string;
  model?: string;
}

export async function handleAnalyzeAudio(
  request: { params: { arguments: AnalyzeAudioToolRequest } },
  openai: OpenAI,
  defaultModel?: string,
) {
  const { audio_path, question, model } = request.params.arguments ?? { audio_path: '' };

  if (!audio_path) {
    return toolError(ErrorCode.INVALID_INPUT, 'audio_path is required.');
  }

  let audioData;
  try {
    audioData = await prepareAudioData(audio_path);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('Blocked host')) return toolErrorFrom(ErrorCode.UPSTREAM_REFUSED, err);
    if (msg.toLowerCase().includes('too large')) {
      return toolErrorFrom(ErrorCode.RESOURCE_TOO_LARGE, err);
    }
    if (msg.toLowerCase().includes('unsupported')) {
      return toolErrorFrom(ErrorCode.UNSUPPORTED_FORMAT, err);
    }
    return toolErrorFrom(ErrorCode.INVALID_INPUT, err);
  }

  let completion: ChatCompletion;
  try {
    completion = await openai.chat.completions.create({
      model: model || defaultModel || DEFAULT_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: question || 'Please transcribe and analyze this audio file.' },
            {
              type: 'input_audio',
              input_audio: {
                data: audioData.data,
                format: audioData.format,
              },
            },
          ],
        },
      ] as ChatCompletionMessageParam[],
    });
  } catch (err) {
    return classifyUpstreamError(err);
  }

  const extracted = extractCompletionText(completion);
  const cutoff = detectReasoningCutoff(extracted);
  if (cutoff) return cutoff;

  if (!extracted.text) {
    return toolError(ErrorCode.INTERNAL, 'Audio model returned no textual content.', {
      finish_reason: extracted.finishReason,
    });
  }
  return {
    content: [{ type: 'text' as const, text: extracted.text }],
    _meta: {
      finish_reason: extracted.finishReason,
      ...(toUsageMeta(extracted.usage) ?? {}),
    },
  };
}
