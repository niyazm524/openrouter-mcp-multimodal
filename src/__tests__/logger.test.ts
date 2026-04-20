import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { log, logger, _sink } from '../logger.js';

describe('logger', () => {
  const lines: string[] = [];
  const origWrite = _sink.write;

  beforeEach(() => {
    lines.length = 0;
    _sink.write = (line: string) => {
      lines.push(line);
    };
  });

  afterEach(() => {
    _sink.write = origWrite;
    vi.unstubAllEnvs();
  });

  it('emits one JSON line per call', () => {
    log('info', 'hello');
    expect(lines).toHaveLength(1);
    const parsed = JSON.parse(lines[0]!);
    expect(parsed.level).toBe('info');
    expect(parsed.msg).toBe('hello');
    expect(parsed.ts).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('merges ctx object', () => {
    log('warn', 'boom', { id: 42 });
    const parsed = JSON.parse(lines[0]!);
    expect(parsed.ctx).toEqual({ id: 42 });
  });

  it('filters below the configured level', () => {
    vi.stubEnv('OPENROUTER_LOG_LEVEL', 'warn');
    log('info', 'should not appear');
    log('debug', 'also no');
    log('warn', 'yes');
    log('error', 'yes');
    expect(lines).toHaveLength(2);
    expect(JSON.parse(lines[0]!).msg).toBe('yes');
    expect(JSON.parse(lines[1]!).level).toBe('error');
  });

  it('unknown level env falls back to info', () => {
    vi.stubEnv('OPENROUTER_LOG_LEVEL', 'chatty');
    log('info', 'hi');
    log('debug', 'no');
    expect(lines).toHaveLength(1);
  });

  it('short-circuits unserializable ctx', () => {
    const circ: Record<string, unknown> = {};
    circ.self = circ;
    log('info', 'broken', circ);
    const parsed = JSON.parse(lines[0]!);
    expect(parsed.ctx).toEqual({ note: 'unserializable' });
  });

  it('exposes logger.error/warn/info/debug helpers', () => {
    logger.error('a');
    logger.warn('b');
    logger.info('c');
    logger.debug('d');
    const levels = lines.map((l) => JSON.parse(l).level);
    // default level is info, so debug is filtered
    expect(levels).toEqual(['error', 'warn', 'info']);
  });
});
