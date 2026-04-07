[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/stabgan-openrouter-mcp-multimodal-badge.png)](https://mseep.ai/app/stabgan-openrouter-mcp-multimodal)

# OpenRouter MCP Multimodal Server

[![npm version](https://img.shields.io/npm/v/@stabgan/openrouter-mcp-multimodal.svg)](https://www.npmjs.com/package/@stabgan/openrouter-mcp-multimodal)
[![Docker Pulls](https://img.shields.io/docker/pulls/stabgan/openrouter-mcp-multimodal.svg)](https://hub.docker.com/r/stabgan/openrouter-mcp-multimodal)
[![Build Status](https://github.com/stabgan/openrouter-mcp-multimodal/actions/workflows/publish.yml/badge.svg)](https://github.com/stabgan/openrouter-mcp-multimodal/actions/workflows/publish.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An OpenRouter MCP server with native vision, image generation, audio analysis, audio generation, and smart image optimization in one package.

Access 300+ LLMs through [OpenRouter](https://openrouter.ai) via the [Model Context Protocol](https://modelcontextprotocol.io), with first-class support for multimodal workflows: analyze images, analyze audio, generate images, generate audio (conversational, speech, or music), and chat — using free or paid models.

## One-Click Install

Add this MCP server to your favorite AI tool:

| Tool | Install |
| ---- | ------- |
| **Kiro** | [![Add to Kiro](https://img.shields.io/badge/Add_to-Kiro-232F3E?logo=amazonaws&logoColor=white)](https://kiro.dev/mcp?url=https://github.com/stabgan/openrouter-mcp-multimodal) |
| **Cursor** | [![Add to Cursor](https://img.shields.io/badge/Add_to-Cursor-000?logo=cursor&logoColor=white)](cursor://anysphere.cursor-deeplink/mcp/install?name=openrouter&config=eyJtY3BTZXJ2ZXJzIjogeyJvcGVucm91dGVyIjogeyJjb21tYW5kIjogIm5weCIsICJhcmdzIjogWyIteSIsICJAc3RhYmdhbi9vcGVucm91dGVyLW1jcC1tdWx0aW1vZGFsIl0sICJlbnYiOiB7Ik9QRU5ST1VURVJfQVBJX0tFWSI6ICJzay1vci12MS0uLi4ifX19fQ==) |
| **VS Code** | [![Add to VS Code](https://img.shields.io/badge/Add_to-VS_Code-007ACC?logo=visualstudiocode&logoColor=white)](vscode://ms-vscode.vscode-mcp/install?config=eyJtY3BTZXJ2ZXJzIjogeyJvcGVucm91dGVyIjogeyJjb21tYW5kIjogIm5weCIsICJhcmdzIjogWyIteSIsICJAc3RhYmdhbi9vcGVucm91dGVyLW1jcC1tdWx0aW1vZGFsIl0sICJlbnYiOiB7Ik9QRU5ST1VURVJfQVBJX0tFWSI6ICJzay1vci12MS0uLi4ifX19fQ==) |
| **Claude Desktop** | [Install Guide](#option-1-npx-no-install) — Add to `claude_desktop_config.json` |
| **Windsurf** | [Install Guide](#option-1-npx-no-install) — Add to `~/.codeium/windsurf/mcp_config.json` |
| **Cline** | [Install Guide](#option-1-npx-no-install) — Add via Cline MCP settings |
| **Smithery** | `npx -y @smithery/cli install @stabgan/openrouter-mcp-multimodal --client claude` |

## Why This One?

| Feature                      | This Server                                                       |
| ---------------------------- | ----------------------------------------------------------------- |
| Text chat with 300+ models   | ✅                                                                |
| Image analysis (vision)      | ✅ Native with sharp optimization                                 |
| Audio analysis               | ✅ Transcription and analysis with base64 encoding                |
| Audio generation             | ✅ Conversational audio, speech, and music generation with format auto-detection |
| Image generation             | ✅                                                                |
| Auto image resize & compress | ✅ (configurable; defaults 800px max, JPEG 80%)                   |
| Model search & validation    | ✅                                                                |
| Free model support           | ✅ (default: free Nemotron VL)                                    |
| Docker support               | ✅ (~345MB Alpine image)                                          |
| HTTP client                  | ✅ Node.js native `fetch` (no axios / node-fetch in this package) |

## Tools

| Tool              | Description                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| `chat_completion` | Send messages to any OpenRouter model. Supports text and multimodal content.                        |
| `analyze_image`   | Analyze images from local files, URLs, or data URIs. Auto-optimized with sharp.                     |
| `analyze_audio`   | Analyze/transcribe audio from local files, URLs, or data URIs. Supports WAV, MP3, FLAC, OGG, etc.  |
| `generate_audio`  | Generate audio from text using conversational or music generation models. Auto-detects output format. |
| `generate_image`  | Generate images from text prompts. Optionally save to disk.                                         |
| `search_models`   | Search/filter models by name, provider, or capabilities (e.g. vision, audio).                       |
| `get_model_info`  | Get pricing, context length, and capabilities for any model.                                        |
| `validate_model`  | Check if a model ID exists on OpenRouter.                                                           |

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

### Security notes

- **`analyze_image`** can read **local files** the Node process can read and can **fetch HTTP(S) URLs**. URL fetches block private/link-local/reserved IPv4 and IPv6 targets (SSRF mitigation) and cap response size; they are still **server-side** requests—avoid pointing at internal-only hosts you rely on staying private.
- **`analyze_audio`** can read **local audio files** and **fetch HTTP(S) URLs**. Same SSRF protections apply. Audio is base64-encoded before sending to OpenRouter (handled automatically).
- **`generate_audio`** can **save audio files** to disk wherever the process has permission. Uses streaming to receive audio chunks. Output format (MP3, WAV, PCM) depends on the model — conversational models return raw PCM16 (auto-wrapped as WAV), music models return MP3. File extension is auto-corrected.
- **`generate_image`** `save_path` writes to disk wherever the process has permission; treat prompts and paths like shell input from the MCP client user.

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

## Architecture

```
src/
├── index.ts              # Server entry point, env validation, graceful shutdown
├── tool-handlers.ts      # Tool registration and routing
├── model-cache.ts        # In-memory model cache (1hr TTL)
├── openrouter-api.ts     # OpenRouter REST client (native fetch)
└── tool-handlers/
    ├── fetch-utils.ts       # Shared SSRF protection, bounded fetch (used by image + audio)
    ├── chat-completion.ts   # Text & multimodal chat
    ├── analyze-image.ts     # Vision analysis pipeline
    ├── analyze-audio.ts     # Audio transcription and analysis
    ├── generate-image.ts    # Image generation
    ├── generate-audio.ts    # Audio generation with streaming + format detection
    ├── image-utils.ts       # Sharp optimization, format detection
    ├── audio-utils.ts       # Audio format detection, base64 encoding
    ├── search-models.ts     # Model search with filtering
    ├── get-model-info.ts    # Model detail lookup
    └── validate-model.ts    # Model existence check
```

Key design decisions:

- **Native `fetch`** for OpenRouter and media URLs (no axios / node-fetch dependency)
- **Shared security layer** — SSRF protection, IP blocking, bounded fetches in `fetch-utils.ts` (single source of truth for image + audio)
- **Lazy sharp loading** — `sharp` is loaded on first image operation, not at startup
- **Singleton model cache** — shared across tool handlers with configurable TTL (default 1 hour)
- **Bounded URL fetches** — timeouts, size limits, redirect cap, and blocked private networks
- **Audio format auto-detection** — magic-byte detection for MP3/WAV/FLAC/OGG, raw PCM auto-wrapped in WAV
- **Graceful error handling** — tools return structured errors instead of crashing the server
- **Process safety** — uncaught exceptions and unhandled rejections exit the process (no zombie servers)

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
npm test                  # Unit tests only (fast, no API key needed)
npm run test:integration  # Live API tests (needs OPENROUTER_API_KEY in .env)
npm run lint
npm run format:check
```

### Docker Build

```bash
docker build -t openrouter-mcp .
docker run -i -e OPENROUTER_API_KEY=sk-or-v1-... openrouter-mcp
```

Multi-stage build: 345MB final image (Alpine + vips runtime only).

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
