import { promises as fs } from 'fs';
import OpenAI from 'openai';
import { resolveSafeOutputPath, UnsafeOutputPathError } from './path-safety.js';
import { ErrorCode, toolError, toolErrorFrom } from '../errors.js';
import { classifyUpstreamError } from './openrouter-errors.js';

export interface GenerateImageToolRequest {
  prompt: string;
  model?: string;
  save_path?: string;
}

const DEFAULT_MODEL = 'google/gemini-2.5-flash-image';

export async function handleGenerateImage(
  request: { params: { arguments: GenerateImageToolRequest } },
  openai: OpenAI,
) {
  const { prompt, model, save_path } = request.params.arguments ?? { prompt: '' };

  if (!prompt?.trim()) {
    return toolError(ErrorCode.INVALID_INPUT, 'prompt is required.');
  }

  // Fail-fast on unsafe paths BEFORE spending tokens.
  let safePathResolved: string | null = null;
  if (save_path) {
    try {
      safePathResolved = await resolveSafeOutputPath(save_path);
    } catch (err) {
      if (err instanceof UnsafeOutputPathError) {
        return toolErrorFrom(ErrorCode.UNSAFE_PATH, err);
      }
      return toolErrorFrom(ErrorCode.INTERNAL, err);
    }
  }

  let completion;
  try {
    completion = await openai.chat.completions.create({
      model: model || DEFAULT_MODEL,
      messages: [{ role: 'user', content: `Generate an image: ${prompt}` }],
    });
  } catch (err) {
    return classifyUpstreamError(err, 'generate_image');
  }

  const message = completion.choices[0]?.message;
  if (!message) {
    return toolError(ErrorCode.INTERNAL, 'No response from model.');
  }

  const base64 = extractBase64(message as unknown as Record<string, unknown>);
  if (!base64) {
    // Model talked but did not emit an image. Surface this as a distinct
    // condition so callers don't treat chatter as a successful image.
    const content = message.content;
    const text = typeof content === 'string' ? content : JSON.stringify(content);
    return toolError(
      ErrorCode.UPSTREAM_REFUSED,
      `Model returned no image. Text response: ${text.slice(0, 300)}`,
      {
        reason: 'no_image_in_response',
        finish_reason: completion.choices[0]?.finish_reason,
      },
    );
  }

  if (safePathResolved) {
    try {
      await fs.writeFile(safePathResolved, Buffer.from(base64.data, 'base64'));
    } catch (err) {
      return toolErrorFrom(ErrorCode.INTERNAL, err, 'Write');
    }
    const usage = completion.usage;
    return {
      content: [
        { type: 'text' as const, text: `Image saved to: ${safePathResolved}` },
        { type: 'image' as const, mimeType: base64.mime, data: base64.data },
      ],
      _meta: {
        save_path: safePathResolved,
        mime: base64.mime,
        ...(usage
          ? {
              usage: {
                prompt_tokens: usage.prompt_tokens,
                completion_tokens: usage.completion_tokens,
                total_tokens: usage.total_tokens,
              },
            }
          : {}),
      },
    };
  }

  const usage = completion.usage;
  return {
    content: [{ type: 'image' as const, mimeType: base64.mime, data: base64.data }],
    _meta: {
      mime: base64.mime,
      ...(usage
        ? {
            usage: {
              prompt_tokens: usage.prompt_tokens,
              completion_tokens: usage.completion_tokens,
              total_tokens: usage.total_tokens,
            },
          }
        : {}),
    },
  };
}

function extractBase64(message: Record<string, unknown>): { data: string; mime: string } | null {
  const images = message.images;
  if (Array.isArray(images) && images.length) {
    for (const img of images as Record<string, unknown>[]) {
      const imageUrl = img.image_url as { url?: string } | undefined;
      const result = parseDataUrl((imageUrl?.url as string) || (img.url as string | undefined));
      if (result) return result;
    }
  }

  if (Array.isArray(message.content)) {
    for (const part of message.content as Record<string, unknown>[]) {
      const iu = part.image_url as { url?: string } | undefined;
      const url = iu?.url || (part.url as string | undefined);
      if (url) {
        const r = parseDataUrl(url);
        if (r) return r;
      }
      const inline = part.inline_data as { data?: string; mime_type?: string } | undefined;
      if (inline?.data) {
        return { data: inline.data, mime: inline.mime_type || 'image/png' };
      }
      if (part.type === 'image' && typeof part.data === 'string') {
        return { data: part.data, mime: (part.mime_type as string) || 'image/png' };
      }
    }
  }

  if (typeof message.content === 'string') {
    const match = message.content.match(/data:image\/([^;]+);base64,([A-Za-z0-9+/=]+)/);
    if (match) return { data: match[2]!, mime: `image/${match[1]}` };
  }

  return null;
}

function parseDataUrl(url?: string): { data: string; mime: string } | null {
  if (!url?.startsWith('data:')) return null;
  const match = url.match(/^data:([^;]+);base64,(.+)$/);
  return match ? { data: match[2]!, mime: match[1]! } : null;
}
