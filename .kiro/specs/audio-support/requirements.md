# Audio Support for OpenRouter MCP Multimodal

## Background

PRs #9 and #10 (identical diffs from `wiesche`) propose adding audio analysis and audio generation tools. The feature concept is sound — audio is a natural extension for a multimodal MCP server — but the implementation has critical issues:

- ~150 lines of security-critical SSRF/network code copy-pasted from `image-utils.ts`
- Dead interfaces (`AudioDelta`, `StreamChunk`) never referenced
- Deprecated `Buffer.slice()` usage
- MP3 magic-byte detection too broad (false positives)
- HTTP URL format detection ignores Content-Type header (only checks path extension)
- Raw PCM returned unplayable when no `save_path` (WAV wrapping only on save path)
- `pcm16`/`pcm24` in supported formats but unmatchable by file extension
- Both PRs are identical — duplicate submission

## Requirements

### REQ-1: Extract Shared Fetch/Security Utilities
- Create `src/tool-handlers/fetch-utils.ts` with all network/security code currently in `image-utils.ts`
- Functions to extract: `readEnvInt`, `ipv4ToUint`, `isBlockedIPv4`, `isBlockedIPv6`, `isIPv4Literal`, `assertUrlSafeForFetch`, `readResponseBodyWithLimit`
- Add a new `fetchHttpResource()` that returns both the Buffer AND the Content-Type header
- Refactor `image-utils.ts` to import from `fetch-utils.ts` instead of having its own copies
- Existing image-utils tests must continue to pass unchanged

### REQ-2: Audio Analysis Tool (`analyze_audio`)
- Create `src/tool-handlers/analyze-audio.ts`
- Accept `audio_path` (file path, URL, or data URL), optional `question`, optional `model`
- Base64-encode audio and send via OpenAI `input_audio` content type
- Default model: `google/gemini-2.5-flash`
- Follow same error handling pattern as `analyze-image.ts`

### REQ-3: Audio Generation Tool (`generate_audio`)
- Create `src/tool-handlers/generate-audio.ts`
- Accept `prompt`, optional `model`, `voice`, `format`, `save_path`
- Stream audio chunks from OpenRouter via SSE
- Detect actual output format from magic bytes (MP3, WAV, FLAC, OGG, raw PCM)
- Always wrap raw PCM in WAV header (both for save and inline return)
- Auto-correct file extension to match detected format
- Handle extensionless save paths correctly
- Use `Buffer.subarray()` not deprecated `Buffer.slice()`
- Tighter MP3 frame sync validation (check version bits)
- No dead/unused interfaces

### REQ-4: Audio Utilities (`audio-utils.ts`)
- Create `src/tool-handlers/audio-utils.ts` using shared `fetch-utils.ts`
- Zero duplication of network/security code
- Separate file-extension formats from API-only formats (`pcm16`/`pcm24`)
- `getAudioFormat()` only matches real file extensions
- HTTP URL format detection: try path extension first, fall back to Content-Type header
- MIME subtype alias mapping (mpeg→mp3, wave→wav, etc.)

### REQ-5: Tool Registration
- Register `analyze_audio` and `generate_audio` in `tool-handlers.ts`
- Proper input schemas with descriptions
- Switch-case dispatch to handlers

### REQ-6: Comprehensive Tests
- `src/__tests__/fetch-utils.test.ts` — test shared SSRF protection, IP blocking, env config
- `src/__tests__/audio-utils.test.ts` — test format detection, MIME mapping, data URL parsing, local file reading, Content-Type fallback
- `src/__tests__/generate-audio.test.ts` — test WAV header creation, magic-byte detection, PCM→WAV wrapping, extension correction, edge cases
- Existing `image-utils.test.ts` must pass without modification (regression guard)

### REQ-7: Build & Lint
- `tsc --noEmit` must pass with zero errors
- `npm run lint` must pass
- `npm test` must pass (all old + new tests)
