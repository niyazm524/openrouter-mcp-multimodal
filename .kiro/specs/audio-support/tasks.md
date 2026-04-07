# Audio Support — Tasks

## Task 1: Create fetch-utils.ts and refactor image-utils.ts
- [x] Create `src/tool-handlers/fetch-utils.ts` with extracted shared code
- [x] Functions: `readEnvInt`, `isBlockedIPv4`, `isBlockedIPv6`, `assertUrlSafeForFetch`, `readResponseBodyWithLimit`, `fetchHttpResource`
- [x] `fetchHttpResource` returns `{ buffer: Buffer, contentType: string | null }`
- [x] Refactor `image-utils.ts` to import from `fetch-utils.ts`
- [x] Re-export `isBlockedIPv4` and `assertUrlSafeForFetch` from `image-utils.ts` for backward compat
- [x] Verify: `npx tsc --noEmit` passes
- [x] Verify: existing `image-utils.test.ts` passes unchanged

## Task 2: Create audio-utils.ts
- [x] Create `src/tool-handlers/audio-utils.ts`
- [x] Import shared code from `fetch-utils.ts` (zero duplication)
- [x] Separate `FILE_AUDIO_FORMATS` from `API_AUDIO_FORMATS`
- [x] `getAudioFormat()` only matches file extensions
- [x] `getAudioMimeType()` maps all formats to MIME types
- [x] `mimeSubtypeToFormat()` with alias mapping
- [x] `formatFromContentType()` for Content-Type header fallback
- [x] `prepareAudioData()` handles data URLs, HTTP URLs (with Content-Type fallback), local files
- [x] Re-export `isBlockedIPv4`, `assertUrlSafeForFetch` for test access
- [x] Verify: `npx tsc --noEmit` passes

## Task 3: Create analyze-audio.ts
- [x] Create `src/tool-handlers/analyze-audio.ts`
- [x] Interface: `AnalyzeAudioToolRequest { audio_path, question?, model? }`
- [x] Handler: validate input, call `prepareAudioData`, send to OpenAI with `input_audio`
- [x] Default model: `google/gemini-2.5-flash`
- [x] Error handling matches `analyze-image.ts` pattern
- [x] Verify: `npx tsc --noEmit` passes

## Task 4: Create generate-audio.ts
- [x] Create `src/tool-handlers/generate-audio.ts`
- [x] Interface: `GenerateAudioToolRequest { prompt, model?, voice?, format?, save_path? }`
- [x] `createWavHeader()` for PCM→WAV wrapping
- [x] `detectAudioFormat()` with magic bytes — use `Buffer.subarray()` not `slice()`
- [x] Tighter MP3 sync: check version bits `!== 0x01`
- [x] `wrapPcmInWav()` helper
- [x] `replaceExtension()` helper (handles extensionless paths)
- [x] Main handler: stream chunks, detect format, always wrap PCM in WAV, save/return
- [x] No dead interfaces (no unused `AudioDelta`/`StreamChunk`)
- [x] Verify: `npx tsc --noEmit` passes

## Task 5: Register tools in tool-handlers.ts
- [x] Add imports for `handleAnalyzeAudio`, `handleGenerateAudio` and their types
- [x] Add `analyze_audio` tool definition with input schema
- [x] Add `generate_audio` tool definition with input schema
- [x] Add switch cases for both tools
- [x] Verify: `npx tsc --noEmit` passes

## Task 6: Write comprehensive tests
- [x] Create `src/__tests__/fetch-utils.test.ts` — 17 tests
- [x] Create `src/__tests__/audio-utils.test.ts` — 17 tests
- [x] Create `src/__tests__/generate-audio.test.ts` — 19 tests
- [x] Existing `image-utils.test.ts` passes unchanged (12 tests) — regression guard
- [x] Verify: `npm test` passes (75 passed, 11 skipped)

## Task 7: Final verification
- [x] `npx tsc --noEmit` — zero errors
- [x] `npm run lint` — passes clean
- [x] `npm test` — 75 tests pass, 11 skipped (integration)
- [x] Existing `image-utils.test.ts` unchanged and passing
- [x] No duplicated security/network code between image-utils and audio-utils
