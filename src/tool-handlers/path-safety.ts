/**
 * Output-path sandbox. Tools that write files (`generate_image`,
 * `generate_audio`, future `generate_video`) route their `save_path`
 * through `resolveSafeOutputPath` so an untrusted MCP caller cannot
 * traverse outside the configured output root.
 *
 * Root resolution order:
 *   1. `OPENROUTER_OUTPUT_DIR` env var (if set and non-empty).
 *   2. `process.cwd()`.
 *
 * Set `OPENROUTER_ALLOW_UNSAFE_PATHS=1` to disable the sandbox entirely
 * (legacy v2 behavior). This is discouraged — document the trade-off
 * where it appears in user configs.
 */
import path from 'node:path';
import { promises as fs } from 'node:fs';

function getOutputRoot(): string {
  const override = process.env.OPENROUTER_OUTPUT_DIR;
  if (override && override.length > 0) return path.resolve(override);
  return process.cwd();
}

function isUnsafeMode(): boolean {
  const v = process.env.OPENROUTER_ALLOW_UNSAFE_PATHS;
  return v === '1' || v?.toLowerCase() === 'true';
}

export class UnsafeOutputPathError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnsafeOutputPathError';
  }
}

/**
 * Resolve and validate a caller-supplied output path. Creates the parent
 * directory if needed. Returns the absolute path that is safe to write.
 *
 * Throws `UnsafeOutputPathError` when the resolved path escapes the root
 * (traversal attempt) and the sandbox is enabled.
 */
export async function resolveSafeOutputPath(savePath: string): Promise<string> {
  if (isUnsafeMode()) {
    const abs = path.resolve(savePath);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    return abs;
  }

  const root = getOutputRoot();
  const rootReal = await fs.realpath(root).catch(() => path.resolve(root));
  // Resolve relative paths against the real root; absolute paths stay as
  // given so we can check them against the root prefix below.
  const candidate = path.isAbsolute(savePath)
    ? path.resolve(savePath)
    : path.resolve(rootReal, savePath);

  // Walk up from the candidate dir to find the first component that exists
  // so we can realpath it. This lets us create new subdirectories under the
  // root while still catching symlink-based traversal.
  const withSep = rootReal.endsWith(path.sep) ? rootReal : rootReal + path.sep;
  const candidateDir = path.dirname(candidate);

  const existingAncestor = await findExistingAncestor(candidateDir);
  const ancestorReal = await fs.realpath(existingAncestor);

  // The realpath of the first-existing ancestor MUST be within the root.
  if (!(ancestorReal === rootReal || ancestorReal.startsWith(withSep))) {
    throw new UnsafeOutputPathError(
      `save_path resolves outside OPENROUTER_OUTPUT_DIR (${rootReal}). ` +
        `Set OPENROUTER_OUTPUT_DIR to a wider root or OPENROUTER_ALLOW_UNSAFE_PATHS=1 to disable this check.`,
    );
  }

  // Safe to create missing intermediate directories now.
  await fs.mkdir(candidateDir, { recursive: true });

  // Re-realpath the final parent in case mkdir traversed a symlink.
  const parentReal = await fs.realpath(candidateDir);
  if (!(parentReal === rootReal || parentReal.startsWith(withSep))) {
    throw new UnsafeOutputPathError(
      `save_path escapes OPENROUTER_OUTPUT_DIR via symlink (${rootReal}).`,
    );
  }

  return path.join(parentReal, path.basename(candidate));
}

async function findExistingAncestor(dir: string): Promise<string> {
  let current = dir;
  for (;;) {
    try {
      await fs.access(current);
      return current;
    } catch {
      const parent = path.dirname(current);
      if (parent === current) return current; // reached root
      current = parent;
    }
  }
}
