# Changelog

All notable changes to `@stabgan/openrouter-mcp-multimodal` are recorded here. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] — 2026-04-20

### Added
- **`generate_video` tool** — submits a text-to-video job to `POST /api/v1/videos`, polls `GET /api/v1/videos/{id}` until `completed` or `failed`, then downloads the mp4 via `GET /api/v1/videos/{id}/content`. Supports `resolution`, `aspect_ratio`, `duration`, `seed`, `first_frame_image`, `last_frame_image`, `reference_images`, and per-provider `provider` passthrough. Emits MCP `notifications/progress` on every poll. Default model `google/veo-3.1`; override via `OPENROUTER_DEFAULT_VIDEO_GEN_MODEL`.
- **`get_video_status` tool** — resume a previously-submitted video job by id. Handles pending/processing/completed/failed uniformly.
- **`analyze_video` tool** — analyze or transcribe video (mp4, mpeg, mov, webm) from a local file, HTTP(S) URL, or base64 data URL. Uses OpenRouter's `video_url` content type. Default model `google/gemini-2.5-flash`.
- **`video-utils.ts`** — magic-byte detection for mp4/mov (ftyp), webm (EBML), MPEG-PS start codes; SSRF-protected HTTP fetch with 100 MB default cap; data-URL and local-file paths.
- **`openrouter-errors.ts`** — shared classifier that maps OpenAI SDK errors, raw fetch errors, and OpenRouter REST 4xx/5xx responses to the closed `ErrorCode` enum. Extracts HTTP status from `err.status`, `err.code`, or `HTTP NNN` in the message. Distinguishes credits / ZDR / rate limits / model-not-found / content policy.
- **`completion-utils.ts`** — shared helpers that render OpenRouter responses to text. Handles multimodal array content and reasoning-only responses (`content: null` + `reasoning`/`reasoning_details`). Detects `finish_reason === 'length'` on reasoning-only output and returns a structured `INVALID_INPUT` with actionable guidance instead of an empty string. Applied to every tool that calls `chat.completions.create` (chat, analyze_image, analyze_audio, analyze_video).
- **`src/errors.ts`** — closed `ErrorCode` enum (`INVALID_INPUT`, `UNSAFE_PATH`, `UPSTREAM_HTTP`, `UPSTREAM_TIMEOUT`, `UPSTREAM_REFUSED`, `UNSUPPORTED_FORMAT`, `RESOURCE_TOO_LARGE`, `ZDR_INCOMPATIBLE`, `MODEL_NOT_FOUND`, `JOB_FAILED`, `JOB_STILL_RUNNING`, `INTERNAL`). Every handler returns `{ isError: true, _meta: { code, details? } }` so clients can switch on failure modes without regex-parsing free text.
- **`src/logger.ts`** — one JSON line per event on stderr; level filtered by `OPENROUTER_LOG_LEVEL`. Replaces ad-hoc `console.error` output.
- **MCP 2025 tool annotations** — every tool advertises `readOnlyHint`, `destructiveHint`, `idempotentHint`.
- **Fail-fast path sandbox** — `save_path` is validated by `resolveSafeOutputPath` BEFORE spending tokens. Unsafe paths return `UNSAFE_PATH` in milliseconds instead of after the model responds.
- **`search_models` capability filters** — `capabilities.audio` and `capabilities.video` in addition to `vision`.
- **Retry-After-aware video client** — `submitVideoJob`, `pollVideoJob`, `downloadVideoContent` on `OpenRouterAPIClient` all use the jitter/Retry-After-aware `fetchWithRetry` with proper `HTTP-Referer` / `X-Title` attribution headers.
- **Multi-arch Docker image** — CI now builds linux/amd64 + linux/arm64 via buildx + QEMU so Apple Silicon users pull a native image.
- **Live E2E test harness** — `scripts/live-e2e.mjs` drives every tool over stdio against the real OpenRouter API. 16/16 green in the release run. Additional smokes: `scripts/smoke-npm-mcp.mjs` (tarball install + stdio), `scripts/smoke-docker-mcp.mjs` (container + stdio), `scripts/mock-e2e-video.mjs` (full video-gen pipeline with mocked API client).

### Fixed (live-traffic bugs uncovered during E2E smoke)
- **Reasoning-model empty response (P1)** — `chat_completion`, `analyze_image`, `analyze_audio`, `analyze_video` now detect when a model (e.g. NVIDIA Nemotron VL) runs `max_tokens` out during chain-of-thought and emits `content: null`. Instead of returning an empty string, the tools return `INVALID_INPUT` with a reasoning preview and guidance to raise `max_tokens` or pick a non-reasoning model.
- **Image-gen silent text-only fallback (P2)** — `generate_image` now returns `UPSTREAM_REFUSED` (`reason: no_image_in_response`) when the model emits chat text without an image payload, instead of passing the chatter through as "success".
- **Error taxonomy gaps** — `generate_audio`, `generate_image`, `analyze_image`, `analyze_audio`, `chat_completion` were all still using raw string errors without `_meta.code`. All migrated through `toolError` / `classifyUpstreamError`.
- **Generate-video upstream error mapping** — OpenRouter's `POST /videos` responds with `HTTP 400 — Model X does not exist` for unknown models. The classifier now extracts the 400 status from the message and maps "does not exist" to `MODEL_NOT_FOUND` (not the overly-broad `INVALID_INPUT`).
- **Fail-fast save_path** — the path sandbox used to run AFTER the OpenRouter call finished, so a rejected write still burned credits. Now validates before submission (sub-millisecond).

### Fixed (security + correctness)
- **BUG-001 — IPv6 SSRF blocklist bypass (P0).** `isBlockedIPv6` missed IPv4-mapped (`::ffff:127.0.0.1`), IPv4-compatible (`::127.0.0.1`), unspecified (`::`), multicast (`ff00::/8`), 6to4 of private IPv4 (`2002::/16`), documentation (`2001:db8::/32`), Teredo (`2001::/32`), ORCHID, and compressed `::1`. Rewrote with a comprehensive IPv6 expander using `node:net`; 22 new test cases cover every class.
- **BUG-003 — `AbortSignal.timeout` reused across retries (P1).** A shared signal meant retries immediately aborted once the first attempt's deadline elapsed. Each attempt now gets a fresh signal with a full budget.
- **BUG-004 — No `Retry-After` + no jitter (P1).** `fetchWithRetry` now honors `Retry-After` (integer seconds or HTTP-date) and applies a 0.5×–1.5× jitter with a 10-second ceiling to avoid thundering-herd retries.
- **BUG-005 — Hardcoded 24 kHz WAV header (P1).** `createWavHeader` and `wrapPcmInWav` now accept a `sampleRate` argument; default remains 24000 for `openai/gpt-audio` compatibility.
- **BUG-006 — Path traversal on `save_path` (P1).** New `src/tool-handlers/path-safety.ts` sandboxes generate-\* writes against `OPENROUTER_OUTPUT_DIR` (default `process.cwd()`). Absolute paths, `..` escapes, and symlink traversal are rejected.
- **BUG-007 — MP3 magic-byte false positives (P1).** Tightened `detectAudioFormat`'s raw-frame-sync check: version, layer, bitrate index, and sample-rate index must all be non-reserved.
- **BUG-008 — `ModelCache` concurrent populate race (P2).** New `ensureFresh(fetcher)` coalesces concurrent callers onto a single in-flight `/models` request.
- **BUG-009 — Data-URL regex rejected MIME parameters (P2).** New `parseBase64DataUrl` handles `data:audio/wav;charset=binary;base64,...` and similar RFC 2397 variants.
- **BUG-010 — Vitest ran every test twice (P2).** `vitest.config.ts` now includes only `src/__tests__/**/*.test.ts`.
- **BUG-011 — No Content-Length short-circuit (P2).** `readResponseBodyWithLimit` rejects oversize responses before streaming and cancels the body on cap breach.
- **BUG-012 — `prepareImageUrl` mislabeled HTTP images (P2).** `optimizeImage` now returns `{ base64, mime }` with magic-byte MIME sniffing fallback when sharp is unavailable.
- **BUG-015 — Search-models `limit` not clamped (P3).** Now clamped to `[1, 50]` server-side even when callers bypass the JSON schema.
- **BUG-016 — `prepare` script forced rebuild on install (P3).** Renamed to `prepublishOnly`. Dockerfile no longer patches `package.json`.
- **BUG-020 — Tests shipped in `dist/` (P3).** `tsconfig.json` excludes `src/__tests__/**` from emit.

### Changed
- **Install links** — rebuilt all one-click install buttons against the current Kiro / Cursor / VS Code / VS Code Insiders deeplink specs. v2 buttons were broken because they wrapped the server config in `{mcpServers:{...}}` which none of the three IDEs accept. Decoded payloads in an HTML comment for audit.
- **Dev workflow** — `.kiro/` (specs + agents + steering) is now gitignored so workspace artifacts don't leak into the published repo. `.mcp-smoke-output/` is gitignored too.
- **Architecture section** — reflects the new `openrouter-errors.ts`, `completion-utils.ts`, `path-safety.ts`, video client methods on `OpenRouterAPIClient`, tightened IPv6 SSRF coverage, and retry-aware backoff.

### Deferred to a future release
- DNS-rebinding TOCTOU pinning via undici.
- Zod-based runtime arg validation at the dispatch layer.
- Streaming completions for `chat_completion` / `analyze_*`.
- MCP resource attachments for generated media (let LLMs re-fetch outputs as MCP resources).
- Per-model pricing × usage = `_meta.cost_usd` estimation.

## [Unreleased]

_(nothing yet)_

## [2.1.0] — Not released

> Internal checkpoint. The fixes listed under Unreleased represent the v2.1 security + correctness audit that lands together with v3 work. If you need a v2.x-only build (without video tools), pin `2.1.0-pre` by building from this commit.

## [2.0.0] — 2026-03

Initial public release with chat, image analysis + generation, audio analysis + generation, model search / info / validate. Native `fetch`, sharp-backed image optimization, streaming audio, SSRF guards for IPv4, Docker + npm + Smithery distribution.
