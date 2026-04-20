import OpenAI from 'openai';
import type {
  ChatCompletion,
  ChatCompletionMessageParam,
} from 'openai/resources/chat/completions.js';
import { prepareVideoData } from './video-utils.js';
import { ErrorCode, toolError, toolErrorFrom } from '../errors.js';
import { logger } from '../logger.js';
import { classifyUpstreamError } from './openrouter-errors.js';
import {
  extractCompletionText,
  detectReasoningCutoff,
  toUsageMeta,
} from './completion-utils.js';

/**
 * Default model — `google/gemini-2.5-flash` has the widest video-input
 * support on OpenRouter at time of writing. Override via env
 * `OPENROUTER_DEFAULT_VIDEO_MODEL` or per-call `model`.
 */
const FALLBACK_DEFAULT_MODEL = 'google/gemini-2.5-flash';

export interface AnalyzeVideoToolRequest {
  video_path: string;
  question?: string;
  model?: string;
}

export async function handleAnalyzeVideo(
  request: { params: { arguments: AnalyzeVideoToolRequest } },
  openai: OpenAI,
  defaultModel?: string,
) {
  const { video_path, question, model } = request.params.arguments ?? {
    video_path: '',
  };

  if (!video_path) {
    return toolError(ErrorCode.INVALID_INPUT, 'video_path is required.');
  }

  const pickedModel =
    model ||
    process.env.OPENROUTER_DEFAULT_VIDEO_MODEL ||
    defaultModel ||
    FALLBACK_DEFAULT_MODEL;

  let videoData;
  try {
    videoData = await prepareVideoData(video_path);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('Blocked host')) {
      return toolErrorFrom(ErrorCode.UPSTREAM_REFUSED, err);
    }
    if (msg.includes('too large')) {
      return toolErrorFrom(ErrorCode.RESOURCE_TOO_LARGE, err);
    }
    if (msg.includes('Unsupported') || msg.includes('not a video')) {
      return toolErrorFrom(ErrorCode.UNSUPPORTED_FORMAT, err);
    }
    return toolErrorFrom(ErrorCode.INVALID_INPUT, err);
  }

  let completion: ChatCompletion;
  try {
    logger.debug('analyze_video.submit', {
      model: pickedModel,
      format: videoData.format,
      size_bytes: videoData.sizeBytes,
    });

    completion = await openai.chat.completions.create({
      model: pickedModel,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: question || 'Describe what happens in this video, step by step.',
            },
            {
              // The `video_url` content type is an OpenRouter extension; the
              // OpenAI SDK's typings don't know about it yet. See:
              // https://openrouter.ai/docs/guides/overview/multimodal/videos
              type: 'video_url',
              video_url: {
                url: `data:${videoData.mediaType};base64,${videoData.data}`,
              },
            },
          ],
        },
      ] as unknown as ChatCompletionMessageParam[],
    });
  } catch (err) {
    logger.warn('analyze_video.error', {
      err: err instanceof Error ? err.message : String(err),
    });
    return classifyUpstreamError(err);
  }

  const extracted = extractCompletionText(completion);
  const cutoff = detectReasoningCutoff(extracted);
  if (cutoff) return cutoff;

  if (!extracted.text) {
    return toolError(ErrorCode.INTERNAL, 'Video model returned no textual content.', {
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
