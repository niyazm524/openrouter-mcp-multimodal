/**
 * Shared helpers for tools that call `openai.chat.completions.create` and
 * return the assistant's message as text. Handles:
 *   - plain string content (the common case)
 *   - multimodal array content (concatenate text parts)
 *   - reasoning-only responses (`content: null` + `reasoning`/`reasoning_details`)
 *   - `finish_reason === 'length'` — warn the caller so they know to raise
 *     `max_tokens` instead of silently getting nothing back.
 */
import type { ChatCompletion } from 'openai/resources/chat/completions.js';
import { ErrorCode, toolError, type ToolErrorResult } from '../errors.js';

export interface ExtractedText {
  text: string;
  /** True when `text` came from the reasoning trace (not a final answer). */
  reasonedOnly: boolean;
  finishReason: ChatCompletion.Choice['finish_reason'] | undefined;
  usage?: ChatCompletion['usage'];
}

interface ChatMessageLike {
  role?: string;
  content?: string | Array<{ type: string; text?: string }> | null;
  reasoning?: string | null;
  reasoning_details?: Array<{ type: string; text?: string }> | null;
}

export function extractCompletionText(completion: ChatCompletion): ExtractedText {
  const choice = completion.choices?.[0];
  const msg = choice?.message as unknown as ChatMessageLike | undefined;
  const finishReason = choice?.finish_reason;
  const usage = completion.usage ?? undefined;

  if (!msg) return { text: '', reasonedOnly: false, finishReason, usage };

  const { content, reasoning, reasoning_details } = msg;

  if (typeof content === 'string' && content.length > 0) {
    return { text: content, reasonedOnly: false, finishReason, usage };
  }
  if (Array.isArray(content)) {
    const parts = content
      .filter((p) => p.type === 'text' && typeof p.text === 'string')
      .map((p) => p.text ?? '');
    const joined = parts.join('');
    if (joined.length > 0) {
      return { text: joined, reasonedOnly: false, finishReason, usage };
    }
  }

  if (typeof reasoning === 'string' && reasoning.length > 0) {
    return { text: reasoning, reasonedOnly: true, finishReason, usage };
  }
  if (Array.isArray(reasoning_details) && reasoning_details.length > 0) {
    const joined = reasoning_details
      .filter((d) => typeof d.text === 'string')
      .map((d) => d.text!)
      .join('\n');
    if (joined.length > 0) {
      return { text: joined, reasonedOnly: true, finishReason, usage };
    }
  }

  return { text: '', reasonedOnly: false, finishReason, usage };
}

/**
 * If the extracted response is reasoning-only and was cut off by
 * `max_tokens`, return a structured INVALID_INPUT suggesting the caller
 * raise the budget. Otherwise return `null` (let the caller format the
 * success response).
 */
export function detectReasoningCutoff(extracted: ExtractedText): ToolErrorResult | null {
  if (extracted.reasonedOnly && extracted.finishReason === 'length') {
    return toolError(
      ErrorCode.INVALID_INPUT,
      'Model exhausted max_tokens during internal reasoning without emitting a final answer. ' +
        'Raise max_tokens or choose a non-reasoning model.',
      {
        finish_reason: extracted.finishReason,
        reasoning_preview: extracted.text.slice(0, 200),
        usage: extracted.usage
          ? {
              prompt_tokens: extracted.usage.prompt_tokens,
              completion_tokens: extracted.usage.completion_tokens,
              total_tokens: extracted.usage.total_tokens,
            }
          : undefined,
      },
    );
  }
  return null;
}

export function toUsageMeta(
  usage: ChatCompletion['usage'] | undefined,
): Record<string, unknown> | undefined {
  if (!usage) return undefined;
  return {
    usage: {
      prompt_tokens: usage.prompt_tokens,
      completion_tokens: usage.completion_tokens,
      total_tokens: usage.total_tokens,
    },
  };
}
