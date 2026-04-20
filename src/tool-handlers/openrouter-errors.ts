/**
 * Shared mapping from OpenRouter / OpenAI SDK error shapes to our closed
 * `ErrorCode` enum. Every tool handler that calls the OpenAI client routes
 * its `catch` block through `classifyUpstreamError` so error taxonomies
 * don't drift.
 */
import { ErrorCode, toolError, type ToolErrorResult } from '../errors.js';

interface SdkLikeError {
  status?: number;
  code?: number | string;
  message?: string;
  error?: { message?: string; code?: number | string } | string;
}

function extractStatus(err: unknown): number | undefined {
  if (typeof err !== 'object' || err === null) return undefined;
  const s = (err as SdkLikeError).status;
  if (typeof s === 'number') return s;
  // openai-node sometimes puts the status in `code` for `APIError`.
  const c = (err as SdkLikeError).code;
  if (typeof c === 'number') return c;
  if (typeof c === 'string' && /^\d{3}$/.test(c)) return parseInt(c, 10);
  // Fall back: parse the message for `HTTP NNN` — our internal client wraps
  // fetch failures as `POST /videos failed: HTTP 400 — <detail>`.
  if (err instanceof Error) {
    const m = err.message.match(/\bHTTP (\d{3})\b/);
    if (m) return parseInt(m[1]!, 10);
  }
  return undefined;
}

function extractMessage(err: unknown): string {
  if (err instanceof Error) {
    const nested = (err as unknown as SdkLikeError).error;
    if (nested && typeof nested === 'object' && typeof nested.message === 'string') {
      return `${err.message} — ${nested.message}`;
    }
    if (typeof nested === 'string') return `${err.message} — ${nested}`;
    return err.message;
  }
  if (typeof err === 'string') return err;
  return 'unknown error';
}

/**
 * Classify a caught error from `openai.*` or a raw `fetch` to the
 * OpenRouter REST API into the closed `ErrorCode` set.
 *
 * Matching strategy:
 *   1. HTTP status first (when available).
 *   2. Message heuristics for common OpenRouter strings (credits, ZDR,
 *      "model does not exist", content policy, etc.).
 *   3. Default to INTERNAL to avoid leaking raw shapes.
 */
export function classifyUpstreamError(err: unknown, _contextMessage?: string): ToolErrorResult {
  const msg = extractMessage(err);
  const status = extractStatus(err);
  const lower = msg.toLowerCase();
  const fullMsg = msg;

  // Explicit credit / balance signals.
  if (
    lower.includes('insufficient balance') ||
    lower.includes('insufficient credits') ||
    lower.includes('requires more credits') ||
    lower.includes('requires at least') ||
    status === 402
  ) {
    return toolError(ErrorCode.UPSTREAM_REFUSED, fullMsg, { status, reason: 'credits' });
  }

  // Zero Data Retention.
  if (lower.includes('zdr') || lower.includes('zero data retention')) {
    return toolError(ErrorCode.ZDR_INCOMPATIBLE, fullMsg, { status });
  }

  // Model lookup failures.
  if (
    lower.includes('model') &&
    (lower.includes('does not exist') || lower.includes('not found') || lower.includes('invalid model'))
  ) {
    return toolError(ErrorCode.MODEL_NOT_FOUND, fullMsg, { status });
  }

  // Content policy / moderation — surface as UPSTREAM_REFUSED so callers can distinguish from 5xx.
  if (lower.includes('content policy') || lower.includes('moderation') || lower.includes('refused')) {
    return toolError(ErrorCode.UPSTREAM_REFUSED, fullMsg, { status, reason: 'policy' });
  }

  // Rate-limit specific.
  if (status === 429 || lower.includes('rate limit')) {
    return toolError(ErrorCode.UPSTREAM_REFUSED, fullMsg, { status, reason: 'rate_limit' });
  }

  // Timeouts (AbortError from `AbortSignal.timeout`).
  if (
    lower.includes('timed out') ||
    lower.includes('timeout') ||
    lower.includes('aborted') ||
    (err instanceof Error && (err as { name?: string }).name === 'AbortError')
  ) {
    return toolError(ErrorCode.UPSTREAM_TIMEOUT, fullMsg, { status });
  }

  // Anything in the 4xx band that isn't covered above — user supplied a bad request.
  if (typeof status === 'number' && status >= 400 && status < 500) {
    return toolError(ErrorCode.INVALID_INPUT, fullMsg, { status });
  }

  // 5xx / network errors.
  if (typeof status === 'number' && status >= 500) {
    return toolError(ErrorCode.UPSTREAM_HTTP, fullMsg, { status });
  }

  return toolError(ErrorCode.UPSTREAM_HTTP, fullMsg);
}
