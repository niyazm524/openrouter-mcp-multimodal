import OpenAI from 'openai';
import type {
  ChatCompletion,
  ChatCompletionMessageParam,
} from 'openai/resources/chat/completions.js';
import { prepareImageUrl } from './image-utils.js';
import { ErrorCode, toolError, toolErrorFrom } from '../errors.js';
import { classifyUpstreamError } from './openrouter-errors.js';
import {
  extractCompletionText,
  detectReasoningCutoff,
  toUsageMeta,
} from './completion-utils.js';

const DEFAULT_MODEL = 'nvidia/nemotron-nano-12b-v2-vl:free';

export interface AnalyzeImageToolRequest {
  image_path: string;
  question?: string;
  model?: string;
}

export async function handleAnalyzeImage(
  request: { params: { arguments: AnalyzeImageToolRequest } },
  openai: OpenAI,
  defaultModel?: string,
) {
  const { image_path, question, model } = request.params.arguments ?? { image_path: '' };

  if (!image_path) {
    return toolError(ErrorCode.INVALID_INPUT, 'image_path is required.');
  }

  let imageUrl: string;
  try {
    imageUrl = await prepareImageUrl(image_path);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('Blocked host')) return toolErrorFrom(ErrorCode.UPSTREAM_REFUSED, err);
    if (msg.toLowerCase().includes('too large')) {
      return toolErrorFrom(ErrorCode.RESOURCE_TOO_LARGE, err);
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
            { type: 'text', text: question || "What's in this image?" },
            { type: 'image_url', image_url: { url: imageUrl } },
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
    return toolError(ErrorCode.INTERNAL, 'Vision model returned no textual content.', {
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
