import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import {
  resolveSafeOutputPath,
  UnsafeOutputPathError,
} from '../tool-handlers/path-safety.js';

describe('resolveSafeOutputPath', () => {
  let root: string;

  beforeEach(async () => {
    root = await fs.mkdtemp(path.join(tmpdir(), 'mcp-path-safety-'));
    vi.stubEnv('OPENROUTER_OUTPUT_DIR', root);
    vi.stubEnv('OPENROUTER_ALLOW_UNSAFE_PATHS', '');
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await fs.rm(root, { recursive: true, force: true });
  });

  it('resolves a relative filename under the root', async () => {
    const out = await resolveSafeOutputPath('output.png');
    expect(out).toBe(path.join(await fs.realpath(root), 'output.png'));
  });

  it('resolves nested relative paths and creates parent dirs', async () => {
    const out = await resolveSafeOutputPath('sub/dir/out.wav');
    const parent = path.dirname(out);
    const stat = await fs.stat(parent);
    expect(stat.isDirectory()).toBe(true);
  });

  it('accepts absolute paths that land inside the root', async () => {
    const abs = path.join(root, 'inside.mp3');
    const out = await resolveSafeOutputPath(abs);
    expect(out).toBe(path.join(await fs.realpath(root), 'inside.mp3'));
  });

  it('rejects traversal attempts (..) that escape the root', async () => {
    await expect(resolveSafeOutputPath('../escape.png')).rejects.toBeInstanceOf(
      UnsafeOutputPathError,
    );
    await expect(resolveSafeOutputPath('../../../etc/passwd')).rejects.toBeInstanceOf(
      UnsafeOutputPathError,
    );
  });

  it('rejects absolute paths outside the root', async () => {
    await expect(resolveSafeOutputPath('/etc/outside.png')).rejects.toBeInstanceOf(
      UnsafeOutputPathError,
    );
  });

  it('bypasses the sandbox when OPENROUTER_ALLOW_UNSAFE_PATHS=1', async () => {
    vi.stubEnv('OPENROUTER_ALLOW_UNSAFE_PATHS', '1');
    const unsafePath = path.join(tmpdir(), `mcp-unsafe-${Date.now()}.bin`);
    const out = await resolveSafeOutputPath(unsafePath);
    expect(out).toBe(path.resolve(unsafePath));
    await fs.rm(path.dirname(unsafePath)).catch(() => undefined);
  });
});
