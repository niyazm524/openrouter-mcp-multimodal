# Audio Support — Design

## Architecture

```
src/tool-handlers/
├── fetch-utils.ts          # NEW — shared network/security (SSRF, IP blocking, bounded fetch)
├── image-utils.ts          # MODIFIED — imports from fetch-utils, no more inline security code
├── audio-utils.ts          # NEW — audio format detection, base64 encoding, fetch (uses fetch-utils)
├── analyze-audio.ts        # NEW — audio analysis/transcription handler
├── generate-audio.ts       # NEW — audio generation handler with streaming + format detection
├── analyze-image.ts        # UNCHANGED
├── generate-image.ts       # UNCHANGED
├── chat-completion.ts      # UNCHANGED
├── search-models.ts        # UNCHANGED
├── get-model-info.ts       # UNCHANGED
└── validate-model.ts       # UNCHANGED

src/__tests__/
├── fetch-utils.test.ts     # NEW — shared security/network tests
├── audio-utils.test.ts     # NEW — audio format/encoding tests
├── generate-audio.test.ts  # NEW — WAV header, detection, wrapping tests
├── image-utils.test.ts     # UNCHANGED — regression guard
├── model-cache.test.ts     # UNCHANGED
└── integration.test.ts     # UNCHANGED
```

## Key Design Decisions

### Shared fetch-utils.ts
The PR duplicated ~150 lines of security code. We extract it once:
- `readEnvInt()` — parse env vars with fallback
- `isBlockedIPv4()` / `isBlockedIPv6()` — SSRF IP blocking
- `assertUrlSafeForFetch()` — full URL validation with DNS resolution
- `fetchHttpResource()` — bounded fetch with redirects, returns `{ buffer, contentType }`

Both `image-utils.ts` and `audio-utils.ts` import from this single source of truth.

### Audio format separation
The PR mixed file-extension formats with API-only formats:
- `FILE_AUDIO_FORMATS` = `['wav', 'mp3', 'aiff', 'aac', 'ogg', 'flac', 'm4a']` — matchable by extension
- `API_AUDIO_FORMATS` = `['pcm16', 'pcm24']` — only for API `format` parameter
- `getAudioFormat()` only matches file extensions (won't return `pcm16`)

### Content-Type fallback for HTTP URLs
Many audio URLs don't have file extensions (CDN, streaming endpoints). When path extension fails, we check the response's `Content-Type` header via `formatFromContentType()`.

### PCM always wrapped in WAV
The PR only wrapped PCM when saving to file. Raw PCM is unplayable. We wrap it in WAV in all code paths (save + inline return).

### Tighter MP3 detection
The PR's `(data[1] & 0xE0) === 0xE0` is too broad. We add: `versionBits !== 0x01` (reserved version).

### MCP audio content type
Confirmed: MCP SDK ^1.27.1 supports `{ type: 'audio', data: string, mimeType: string }`. The PR's usage is valid.

## Data Flow

### analyze_audio
```
audio_path → prepareAudioData() → { base64, format }
  → openai.chat.completions.create({ input_audio: { data, format } })
  → text response
```

### generate_audio
```
prompt → openai.chat.completions.create({ stream: true, modalities: ['text','audio'] })
  → collect audio chunks (base64 strings)
  → join → decode → detectAudioFormat(magic bytes)
  → if PCM: wrapPcmInWav()
  → if save_path: write file (auto-correct extension)
  → return { type: 'audio', data, mimeType }
```
