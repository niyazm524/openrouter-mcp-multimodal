import OpenAI from 'openai';
import type {
  ChatCompletion,
  ChatCompletionMessageParam,
} from 'openai/resources/chat/completions.js';
import { ErrorCode, toolError } from '../errors.js';
import { classifyUpstreamError } from './openrouter-errors.js';
import {
  extractCompletionText,
  detectReasoningCutoff,
  toUsageMeta,
} from './completion-utils.js';

export interface ChatCompletionToolRequest {
  model?: string;
  messages: ChatCompletionMessageParam[];
  temperature?: number;
  max_tokens?: number;
}

export async function handleChatCompletion(
  request: { params: { arguments: ChatCompletionToolRequest } },
  openai: OpenAI,
  defaultModel?: string,
) {
  const { messages, model, temperature, max_tokens } = request.params.arguments ?? {
    messages: [],
  };

  if (!messages?.length) {
    return toolError(ErrorCode.INVALID_INPUT, 'Messages array cannot be empty.');
  }

  let completion: ChatCompletion;
  try {
    completion = await openai.chat.completions.create({
      model: model || defaultModel || 'nvidia/nemotron-nano-12b-v2-vl:free',
      messages,
      temperature: temperature ?? 1,
      ...(max_tokens && { max_tokens }),
    });
  } catch (err) {
    return classifyUpstreamError(err);
  }

  const extracted = extractCompletionText(completion);
  const cutoff = detectReasoningCutoff(extracted);
  if (cutoff) return cutoff;

  if (!extracted.text) {
    return toolError(ErrorCode.INTERNAL, 'Model returned no textual content.', {
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
