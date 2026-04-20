[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/stabgan-openrouter-mcp-multimodal-badge.png)](https://mseep.ai/app/stabgan-openrouter-mcp-multimodal)

# OpenRouter MCP Multimodal Server

[![npm version](https://img.shields.io/npm/v/@stabgan/openrouter-mcp-multimodal.svg?label=npm&color=cb3837&logo=npm)](https://www.npmjs.com/package/@stabgan/openrouter-mcp-multimodal)
[![Docker Image Version](https://img.shields.io/docker/v/stabgan/openrouter-mcp-multimodal/latest?label=docker&color=2496ed&logo=docker&logoColor=white)](https://hub.docker.com/r/stabgan/openrouter-mcp-multimodal)
[![Build Status](https://github.com/stabgan/openrouter-mcp-multimodal/actions/workflows/publish.yml/badge.svg)](https://github.com/stabgan/openrouter-mcp-multimodal/actions/workflows/publish.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%E2%89%A518-43853d?logo=node.js&logoColor=white)](https://nodejs.org)

### 📊 By the numbers

[![npm total downloads](https://img.shields.io/npm/dt/@stabgan/openrouter-mcp-multimodal.svg?label=npm%20total%20downloads&color=cb3837&logo=npm)](https://www.npmjs.com/package/@stabgan/openrouter-mcp-multimodal)
[![npm monthly](https://img.shields.io/npm/dm/@stabgan/openrouter-mcp-multimodal.svg?label=npm%2Fmonth&color=cb3837&logo=npm)](https://www.npmjs.com/package/@stabgan/openrouter-mcp-multimodal)
[![Docker Pulls](https://img.shields.io/docker/pulls/stabgan/openrouter-mcp-multimodal.svg?label=docker%20pulls&color=2496ed&logo=docker&logoColor=white)](https://hub.docker.com/r/stabgan/openrouter-mcp-multimodal)
[![GitHub stars](https://img.shields.io/github/stars/stabgan/openrouter-mcp-multimodal.svg?label=stars&color=f5d024&logo=github)](https://github.com/stabgan/openrouter-mcp-multimodal/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/stabgan/openrouter-mcp-multimodal.svg?label=forks&color=6e5494&logo=github)](https://github.com/stabgan/openrouter-mcp-multimodal/network/members)

> **3,800+ installs** across npm + Docker Hub since launch, **~940 npm installs/month** and accelerating. Thanks to everyone who starred ⭐, forked 🍴, and shipped with it — every badge above is live so you're always looking at today's numbers.

---

An OpenRouter MCP server with native vision, image generation, audio analysis, audio generation, and v3 video analysis + generation in one package.

Access 300+ LLMs through [OpenRouter](https://openrouter.ai) via the [Model Context Protocol](https://modelcontextprotocol.io), with first-class support for multimodal workflows: analyze images / audio / video, generate images / audio / video, and chat — using free or paid models. Every tool returns a structured `_meta.code` on failure so MCP clients can switch on error classes without parsing strings.

## One-Click Install

Add this MCP server to your AI tool. Every button below was regenerated from the current install spec of each tool and verified against its official docs (see [`scripts/make-install-links.mjs`](./scripts/make-install-links.mjs) for the payloads).

| Tool | Install |
| ---- | ------- |
| **Kiro** | [![Add to Kiro](https://img.shields.io/badge/Add_to-Kiro-232F3E?logo=amazonaws&logoColor=white)](https://kiro.dev/launch/mcp/add?name=openrouter&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%40stabgan%2Fopenrouter-mcp-multimodal%22%5D%2C%22env%22%3A%7B%22OPENROUTER_API_KEY%22%3A%22sk-or-v1-...%22%7D%2C%22disabled%22%3Afalse%2C%22autoApprove%22%3A%5B%5D%7D) |
| **Cursor** | [![Add to Cursor](https://img.shields.io/badge/Add_to-Cursor-000?logo=cursor&logoColor=white)](cursor://anysphere.cursor-deeplink/mcp/install?name=openrouter&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBzdGFiZ2FuL29wZW5yb3V0ZXItbWNwLW11bHRpbW9kYWwiXSwiZW52Ijp7Ik9QRU5ST1VURVJfQVBJX0tFWSI6InNrLW9yLXYxLS4uLiJ9fQ==) |
| **VS Code** | [![Add to VS Code](https://img.shields.io/badge/Add_to-VS_Code-007ACC?logo=visualstudiocode&logoColor=white)](vscode:mcp/install?%7B%22name%22%3A%22openrouter%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%40stabgan%2Fopenrouter-mcp-multimodal%22%5D%2C%22env%22%3A%7B%22OPENROUTER_API_KEY%22%3A%22sk-or-v1-...%22%7D%7D) |
| **VS Code Insiders** | [![Add to VS Code Insiders](https://img.shields.io/badge/Add_to-VS_Code_Insiders-24bfa5?logo=visualstudiocode&logoColor=white)](vscode-insiders:mcp/install?%7B%22name%22%3A%22openrouter%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%40stabgan%2Fopenrouter-mcp-multimodal%22%5D%2C%22env%22%3A%7B%22OPENROUTER_API_KEY%22%3A%22sk-or-v1-...%22%7D%7D) |
| **Claude Desktop** | [Install Guide](#option-1-npx-no-install) — Add to `claude_desktop_config.json` |
| **Windsurf** | [Install Guide](#option-1-npx-no-install) — Add to `~/.codeium/windsurf/mcp_config.json` |
| **Cline** | [Install Guide](#option-1-npx-no-install) — Add via Cline MCP settings |
| **Smithery** | `npx -y @smithery/cli install @stabgan/openrouter-mcp-multimodal --client claude` |

> After clicking, the target client opens a confirmation prompt. You'll still need to paste your `OPENROUTER_API_KEY` — the deeplink ships a placeholder string so no secrets end up in links you share.

<!--
README install-link audit (2026-04-20):
 - Kiro button uses the current schema from https://kiro.dev/docs/mcp/servers/#install-link-schema
   (https://kiro.dev/launch/mcp/add?name=<name>&config=<url-encoded JSON of the server body>)
   v2's button pointed at https://kiro.dev/mcp?url=... which is not a supported route.
 - Cursor button uses cursor://anysphere.cursor-deeplink/mcp/install?name=<name>&config=<base64>
   where the base64 decodes to just the server body ({command, args, env}).
   v2's button wrapped it in {mcpServers:{openrouter:{...}}} which Cursor does not accept.
 - VS Code button uses vscode:mcp/install?<URL-encoded JSON> where the JSON is
   {name, command, args, env}. v2's button used vscode://ms-vscode.vscode-mcp/install
   (wrong scheme) and the mcpServers-wrapped payload. Fixed.
 - Regenerate with: node scripts/make-install-links.mjs
-->

## Why This One?

| Feature                      | This Server                                                       |
| ---------------------------- | ----------------------------------------------------------------- |
| Text chat with 300+ models   | ✅                                                                |
| Image analysis (vision)      | ✅ Native with sharp optimization                                 |
| Audio analysis               | ✅ Transcription + analysis, base64 auto-encoded                  |
| Audio generation             | ✅ Conversational audio, speech, and music with format auto-detection |
| Image generation             | ✅ Path-sandboxed disk output                                     |
| **Video understanding**      | ✅ **v3** — mp4, mpeg, mov, webm from files, URLs, or data URLs   |
| **Video generation**         | ✅ **v3** — Veo 3.1 / Sora 2 Pro / Seedance / Wan via OpenRouter's async API, with progress notifications and resumable jobs |
| Auto image resize & compress | ✅ (configurable; defaults 800px max, JPEG 80%)                   |
| Model search & validation    | ✅ Filter by vision / audio / video input modality               |
| Free model support           | ✅ (default: free Nemotron VL)                                    |
| Docker support               | ✅ Multi-arch (linux/amd64 + linux/arm64), ~345 MB Alpine         |
| HTTP client                  | ✅ Node.js native `fetch`, Retry-After + jitter, IPv4/IPv6 SSRF blocklist |
| Structured errors            | ✅ Closed `_meta.code` taxonomy so clients can switch on failure modes |
| Reasoning-model awareness    | ✅ Detects `max_tokens` cutoff during CoT and guides the caller    |
| MCP 2025 annotations         | ✅ Every tool ships `readOnlyHint` / `destructiveHint` / `idempotentHint` |

## Tools

| Tool              | Description                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| `chat_completion` | Send messages to any OpenRouter model. Detects reasoning-model cutoffs and surfaces them clearly.    |
| `analyze_image`   | Analyze images from local files, URLs, or data URIs. Auto-optimized with sharp.                     |
| `analyze_audio`   | Analyze/transcribe audio from local files, URLs, or data URIs. Supports WAV, MP3, FLAC, OGG, etc.   |
| `analyze_video`   | Analyze/transcribe video (mp4, mpeg, mov, webm) from local files, URLs, or base64 data URIs.        |
| `generate_audio`  | Generate audio from text. Auto-detects output format, wraps raw PCM in WAV, optional disk save.      |
| `generate_image`  | Generate images from text prompts. Optional disk save (path-sandboxed).                             |
| `generate_video`  | Generate video via OpenRouter's async API (Veo 3.1 / Sora 2 Pro / Seedance / Wan). Submits, polls, downloads, saves. |
| `get_video_status`| Resume polling a `generate_video` job by id, download + save the result when complete.              |
| `search_models`   | Search/filter models by name, provider, or capabilities (vision / audio / video).                   |
| `get_model_info`  | Get pricing, context length, and capabilities for any model.                                        |
| `validate_model`  | Check if a model ID exists on OpenRouter.                                                           |

All error responses carry `_meta.code` from a closed error taxonomy (`INVALID_INPUT`, `UNSAFE_PATH`, `UPSTREAM_HTTP`, `UPSTREAM_TIMEOUT`, `UPSTREAM_REFUSED`, `UNSUPPORTED_FORMAT`, `RESOURCE_TOO_LARGE`, `ZDR_INCOMPATIBLE`, `MODEL_NOT_FOUND`, `JOB_FAILED`, `JOB_STILL_RUNNING`, `INTERNAL`) so MCP clients can switch on failure modes without parsing strings.

## Quick Start

### Prerequisites

Get a free API key from [openrouter.ai/keys](https://openrouter.ai/keys).

### Option 1: npx (no install)

```json
{
  "mcpServers": {
    "openrouter": {
      "command": "npx",
      "args": ["-y", "@stabgan/openrouter-mcp-multimodal"],
      "env": {
        "OPENROUTER_API_KEY": "sk-or-v1-..."
      }
    }
  }
}
```

### Option 2: Docker

```json
{
  "mcpServers": {
    "openrouter": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "-e", "OPENROUTER_API_KEY=sk-or-v1-...",
        "stabgan/openrouter-mcp-multimodal:latest"
      ]
    }
  }
}
```

### Option 3: Global install

```bash
npm install -g @stabgan/openrouter-mcp-multimodal
```

Then add to your MCP config:

```json
{
  "mcpServers": {
    "openrouter": {
      "command": "openrouter-multimodal",
      "env": {
        "OPENROUTER_API_KEY": "sk-or-v1-..."
      }
    }
  }
}
```

### Option 4: Smithery

```bash
npx -y @smithery/cli install @stabgan/openrouter-mcp-multimodal --client claude
```

## Configuration

| Environment Variable                  | Required | Default                               | Description                                           |
| ------------------------------------- | -------- | ------------------------------------- | ----------------------------------------------------- |
| `OPENROUTER_API_KEY`                  | Yes      | —                                     | Your OpenRouter API key                               |
| `OPENROUTER_DEFAULT_MODEL`            | No       | `nvidia/nemotron-nano-12b-v2-vl:free` | Default model for chat, analyze, and similar tools    |
| `DEFAULT_MODEL`                       | No       | —                                     | Alias for `OPENROUTER_DEFAULT_MODEL`                  |
| `OPENROUTER_MODEL_CACHE_TTL_MS`       | No       | `3600000`                             | How long cached `/models` data is valid (ms)          |
| `OPENROUTER_IMAGE_MAX_DIMENSION`      | No       | `800`                                 | Longest edge for resize before vision requests (px)   |
| `OPENROUTER_IMAGE_JPEG_QUALITY`       | No       | `80`                                  | JPEG quality after optimization (1–100)               |
| `OPENROUTER_IMAGE_FETCH_TIMEOUT_MS`   | No       | `30000`                               | Per-request timeout for image URLs                    |
| `OPENROUTER_IMAGE_MAX_DOWNLOAD_BYTES` | No       | `26214400`                            | Max bytes when downloading an image URL (~25 MB)      |
| `OPENROUTER_IMAGE_MAX_REDIRECTS`      | No       | `8`                                   | Max HTTP redirects when fetching an image URL         |
| `OPENROUTER_IMAGE_MAX_DATA_URL_BYTES` | No       | `20971520`                            | Approx max decoded size for base64 data URLs (~20 MB) |
| `OPENROUTER_AUDIO_FETCH_TIMEOUT_MS`   | No       | `30000`                               | Per-request timeout for audio URLs                    |
| `OPENROUTER_AUDIO_MAX_DOWNLOAD_BYTES` | No       | `26214400`                            | Max bytes when downloading an audio URL (~25 MB)      |
| `OPENROUTER_AUDIO_MAX_REDIRECTS`      | No       | `8`                                   | Max HTTP redirects when fetching an audio URL         |
| `OPENROUTER_AUDIO_MAX_DATA_URL_BYTES` | No       | `20971520`                            | Approx max decoded size for base64 audio data URLs    |
| `OPENROUTER_DEFAULT_VIDEO_MODEL`      | No       | `google/gemini-2.5-flash`             | Default model for `analyze_video`                     |
| `OPENROUTER_DEFAULT_VIDEO_GEN_MODEL`  | No       | `google/veo-3.1`                      | Default model for `generate_video`                    |
| `OPENROUTER_VIDEO_FETCH_TIMEOUT_MS`   | No       | `60000`                               | Per-request timeout for video URLs                    |
| `OPENROUTER_VIDEO_MAX_DOWNLOAD_BYTES` | No       | `104857600`                           | Max bytes when downloading a video URL (~100 MB)      |
| `OPENROUTER_VIDEO_MAX_REDIRECTS`      | No       | `8`                                   | Max HTTP redirects when fetching a video URL          |
| `OPENROUTER_VIDEO_MAX_DATA_URL_BYTES` | No       | `104857600`                           | Approx max decoded size for base64 video data URLs    |
| `OPENROUTER_VIDEO_POLL_INTERVAL_MS`   | No       | `15000`                               | Poll cadence for async video generation               |
| `OPENROUTER_VIDEO_MAX_WAIT_MS`        | No       | `600000`                              | Max wait for a `generate_video` job before returning a resumable handle |
| `OPENROUTER_VIDEO_GEN_MAX_BYTES`      | No       | `268435456`                           | Max bytes for a generated-video download (~256 MB)    |
| `OPENROUTER_VIDEO_INLINE_MAX_BYTES`   | No       | `10485760`                            | Inline video content block ceiling (~10 MB). Larger outputs are referenced by `save_path` only. |
| `OPENROUTER_OUTPUT_DIR`               | No       | `process.cwd()`                       | Sandbox root for `save_path` on generate tools. Writes outside this directory are rejected. |
| `OPENROUTER_ALLOW_UNSAFE_PATHS`       | No       | —                                     | Set to `1` to disable the output sandbox (legacy v2 behavior). Not recommended. |
| `OPENROUTER_LOG_LEVEL`                | No       | `info`                                | `error` \| `warn` \| `info` \| `debug` — JSON logs on stderr. |

### Security notes

- **`analyze_image`** can read **local files** the Node process can read and can **fetch HTTP(S) URLs**. URL fetches block private/link-local/reserved IPv4 and IPv6 targets (SSRF mitigation) and cap response size; they are still **server-side** requests — avoid pointing at internal-only hosts you rely on staying private.
- **`analyze_audio`** can read **local audio files** and **fetch HTTP(S) URLs**. Same SSRF protections apply. Audio is base64-encoded before sending to OpenRouter (handled automatically).
- **`generate_audio`** and **`generate_image`** write to disk through a path sandbox: `save_path` is resolved against `OPENROUTER_OUTPUT_DIR` (default: the current working directory) and any attempt to escape the root via `..`, absolute paths, or symlinks is rejected. Override with `OPENROUTER_OUTPUT_DIR=/some/dir` or, for legacy v2 behavior, `OPENROUTER_ALLOW_UNSAFE_PATHS=1`.
- **IPv6 SSRF blocklist** covers loopback, unspecified, IPv4-mapped, IPv4-compatible, link-local, site-local, ULA, multicast, documentation, Teredo, ORCHID, and 6to4 of private IPv4. If you need to reach a specifically reserved range, you'll have to fork.

## Usage Examples

### Chat

```
Use chat_completion to explain quantum computing in simple terms.
```

### Analyze an Image

```
Use analyze_image on /path/to/photo.jpg and tell me what you see.
```

### Analyze Audio

```
Use analyze_audio on /path/to/recording.mp3 with model "google/gemini-2.5-flash" to transcribe it.
```

### Analyze Video

```
Use analyze_video on /path/to/clip.mp4 with question "what happens at 00:15?" to get a scene-by-scene description.
```

Supports mp4, mpeg, mov, webm (from local files, HTTP(S) URLs, or base64 data URLs). URLs are fetched through the same SSRF-protected path as image and audio URLs.

### Generate Conversational Audio

```
Use generate_audio with prompt "Explain what a neural network is" and voice "alloy", save to ./response.wav
```

### Generate Music (Lyria)

```
Use generate_audio with model "google/lyria-3-clip-preview" and prompt:
"upbeat jazz piano trio with walking bass and brushed snare"
Save to ./jazz.wav
```

The file will be auto-saved as `jazz.mp3` since Lyria returns MP3.

### Find Vision Models

```
Use search_models with capabilities.vision = true to find models that can see images.
```

### Generate an Image

```
Use generate_image with prompt "a cat astronaut on mars, digital art" and save to ./cat.png
```

### Generate Video

```
Use generate_video with model "google/veo-3.1", prompt "a calm river at sunrise,
cinematic", resolution 720p, aspect_ratio 16:9, duration 4, save to ./river.mp4
```

`generate_video` submits the job, polls OpenRouter until it's either `completed` (downloads + saves the mp4) or runs past `max_wait_ms` (returns a `JOB_STILL_RUNNING` handle with `video_id`). Resume with `get_video_status`:

```
Use get_video_status with video_id "vid_abc123" and save_path "./river.mp4"
```

Long-running jobs emit MCP progress notifications every poll so hosts can show a spinner instead of hanging.

## Architecture

```
src/
├── index.ts              # Server entry, env validation, graceful shutdown
├── tool-handlers.ts      # Tool registration (11 tools, annotated) + dispatch
├── model-cache.ts        # In-memory model cache — TTL + in-flight coalescing
├── openrouter-api.ts     # REST client (chat + /videos submit/poll/download)
├── errors.ts             # Closed ErrorCode enum + toolError helper
├── logger.ts             # JSON-line structured logger (stderr)
└── tool-handlers/
    ├── fetch-utils.ts          # Shared SSRF, bounded fetch, data-URL parser
    ├── openrouter-errors.ts    # SDK/HTTP error → ErrorCode classifier
    ├── completion-utils.ts     # Reasoning-model cutoff detection + text extraction
    ├── path-safety.ts          # save_path sandbox for generate tools
    ├── chat-completion.ts      # Text & multimodal chat
    ├── analyze-image.ts        # Vision analysis
    ├── analyze-audio.ts        # Audio transcription / analysis
    ├── analyze-video.ts        # Video understanding (v3)
    ├── generate-image.ts       # Image generation
    ├── generate-audio.ts       # Audio generation with streaming + format detection
    ├── generate-video.ts       # Video generation — async submit/poll/download (v3)
    ├── image-utils.ts          # Sharp optimization, MIME sniffing
    ├── audio-utils.ts          # Audio format detection, base64 encoding
    ├── video-utils.ts          # Video format detection (mp4/mov/webm/mpeg), base64 (v3)
    ├── search-models.ts        # Model search with capability filtering
    ├── get-model-info.ts       # Model detail lookup
    └── validate-model.ts       # Model existence check
```

Key design decisions:

- **Native `fetch`** everywhere — no axios, no node-fetch.
- **Shared security layer** — IPv4 + IPv6 SSRF blocklists, bounded fetches, redirect cap in `fetch-utils.ts`. IPv6 covers loopback, unspecified, IPv4-mapped, IPv4-compatible, link-local, site-local, ULA, multicast, documentation, Teredo, ORCHID, and 6to4 of private IPv4.
- **Path sandbox** — every `save_path` is validated via `resolveSafeOutputPath` _before_ spending tokens; symlink-aware realpath checks defeat traversal.
- **Retry-After-aware backoff** — `fetchWithRetry` honors `Retry-After` (seconds + HTTP-date) and applies jitter to avoid thundering-herd.
- **Cache coalescing** — concurrent `search_models` / `get_model_info` calls share a single in-flight `/models` request.
- **Reasoning-model awareness** — `completion-utils.ts` detects `content: null` with trailing `reasoning_details` and `finish_reason === 'length'`, returning a structured `INVALID_INPUT` with a preview and advice instead of an empty string.
- **Lazy sharp loading** — sharp loads on first image op, not at startup.
- **Audio format auto-detection** — magic-byte detection for MP3/WAV/FLAC/OGG with reserved-bit rejection; raw PCM wrapped in WAV at a configurable sample rate.
- **Video generation** — `generate_video` wraps OpenRouter's async submit → poll → download loop with configurable `max_wait_ms` and `poll_interval_ms`, emits MCP `notifications/progress` on every poll, and returns a resumable handle on timeout (use `get_video_status`).
- **Graceful errors** — every handler returns `{ isError, content, _meta: { code, details? } }`; no uncaught throws reach the MCP transport.
- **Process safety** — uncaught exceptions and unhandled rejections exit the process (no zombie servers).

## Roadmap

v3.0.0 ships `analyze_video` + `generate_video` + `get_video_status` alongside a structured error taxonomy, MCP 2025 tool annotations, reasoning-model cutoff detection, and fail-fast path sandboxing. See [`CHANGELOG.md`](./CHANGELOG.md) for the full list of changes.


## Development

```bash
git clone https://github.com/stabgan/openrouter-mcp-multimodal.git
cd openrouter-mcp-multimodal
npm install
cp .env.example .env  # Add your API key
npm run build
npm start
```

### Run Tests

```bash
npm test                  # Unit tests (163 tests, <1 s, no API key needed)
npm run test:integration  # Live API tests (needs OPENROUTER_API_KEY in .env)
npm run lint
npm run format:check
node scripts/live-e2e.mjs # Drives every tool over stdio against real OpenRouter
```

The live E2E harness in `scripts/live-e2e.mjs` spawns the built server, runs each tool once, verifies the structured-error taxonomy (`UPSTREAM_REFUSED`, `UNSAFE_PATH`, `MODEL_NOT_FOUND`, …), and writes a JSON summary to `.mcp-smoke-output/run-results.json`. Requires `OPENROUTER_API_KEY` in `.env`.

### Docker Build

```bash
docker build -t openrouter-mcp .
docker run -i -e OPENROUTER_API_KEY=sk-or-v1-... openrouter-mcp
```

Multi-stage build: 345MB final image (Alpine + vips runtime only).

## Upgrading from v2

v3 is **additive** — no tool schemas or env vars were removed. What changed:

- **Three new tools**: `analyze_video`, `generate_video`, `get_video_status`. Ignore them if you don't need video.
- **Structured error `_meta.code`** on every handler's error response. Text messages are preserved; clients that ignored `_meta` before continue to work.
- **`save_path` now sandboxed by default**. Generated images/audio/video default to `process.cwd()`. Set `OPENROUTER_OUTPUT_DIR=/some/dir` to widen the root, or `OPENROUTER_ALLOW_UNSAFE_PATHS=1` to restore v2 behavior.
- **Reasoning-model awareness**: if you were pointing `chat_completion` or `analyze_image` at a reasoning model with tight `max_tokens`, you'd previously get empty strings back. v3 returns `INVALID_INPUT` with a reasoning preview instead. Raise `max_tokens` or pick a non-reasoning model.
- **IPv6 SSRF coverage extended** to IPv4-mapped, IPv4-compatible, multicast, 6to4 of private ranges, Teredo, ORCHID, and documentation ranges. If you were reaching private IPv6 targets (unusual), audit your setup.
- **`prepare` → `prepublishOnly`** in `package.json` so `npm install` stops triggering a TypeScript rebuild for end users.

## Compatibility

Works with any MCP client:

- [Kiro](https://kiro.dev)
- [Claude Desktop](https://claude.ai/download)
- [Cursor](https://cursor.sh)
- [Windsurf](https://codeium.com/windsurf)
- [Cline](https://github.com/cline/cline)
- Any MCP-compatible client

## License

MIT

## Contributing

Issues and PRs welcome. Please open an issue first for major changes.
