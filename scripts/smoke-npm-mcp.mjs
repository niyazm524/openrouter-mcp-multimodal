#!/usr/bin/env node
/**
 * End-to-end smoke: install the tarball in a scratch dir, spawn the
 * installed `openrouter-multimodal` bin over stdio, list its tools,
 * call `validate_model` against a known-good id. Exits non-zero if
 * anything is off.
 */
import 'dotenv/config';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import path from 'node:path';

const scratch = path.resolve('.mcp-smoke-output/npm-install-test');
const bin = path.join(scratch, 'node_modules', '.bin', 'openrouter-multimodal');

const proc = spawn(bin, [], {
  env: { ...process.env, OPENROUTER_LOG_LEVEL: 'warn' },
  stdio: ['pipe', 'pipe', 'pipe'],
});
proc.stderr.on('data', (c) => process.stderr.write(c));

let buf = '';
const pending = new Map();
let nextId = 1;
proc.stdout.on('data', (chunk) => {
  buf += chunk.toString('utf8');
  const lines = buf.split('\n');
  buf = lines.pop() ?? '';
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const msg = JSON.parse(line);
      if (msg.id !== undefined && pending.has(msg.id)) {
        pending.get(msg.id).resolve(msg);
        pending.delete(msg.id);
      }
    } catch {
      /* ignore */
    }
  }
});

function rpc(method, params) {
  const id = nextId++;
  return new Promise((resolve) => {
    pending.set(id, { resolve });
    proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
  });
}

let failures = 0;
function check(name, cond, detail) {
  if (cond) {
    console.log(`✓ ${name}`);
  } else {
    console.log(`✗ ${name}: ${detail}`);
    failures += 1;
  }
}

try {
  const init = await Promise.race([
    rpc('initialize', {
      protocolVersion: '2025-03-26',
      capabilities: {},
      clientInfo: { name: 'npm-smoke', version: '1.0' },
    }),
    delay(5000).then(() => ({ error: 'init timeout' })),
  ]);
  check('initialize', !init.error && init.result?.serverInfo?.version === '3.0.0',
    `got ${JSON.stringify(init.result?.serverInfo ?? init.error)}`);

  const list = await rpc('tools/list', {});
  const names = list.result?.tools?.map((t) => t.name) ?? [];
  check('tools/list returns 11 tools', names.length === 11, `got ${names.length}: ${names.join(',')}`);
  check('has analyze_video', names.includes('analyze_video'), 'missing');
  check('has generate_video', names.includes('generate_video'), 'missing');
  check('has get_video_status', names.includes('get_video_status'), 'missing');

  // Every tool has annotations.
  const allAnnotated = list.result?.tools?.every((t) => t.annotations);
  check('every tool annotated', allAnnotated, 'some tool missing annotations');

  // Run validate_model (requires API key).
  if (process.env.OPENROUTER_API_KEY) {
    const r = await rpc('tools/call', {
      name: 'validate_model',
      arguments: { model: 'openai/gpt-4' },
    });
    const text = r.result?.content?.[0]?.text;
    check('validate_model openai/gpt-4', text === '{"valid":true}', `got ${text}`);
  } else {
    console.log('⚠ skipping live validate_model (no API key)');
  }

  // Call without API key env -- should still start (we set it from parent).
  // Invalid input path.
  const bad = await rpc('tools/call', {
    name: 'chat_completion',
    arguments: { messages: [] },
  });
  check('empty messages returns INVALID_INPUT',
    bad.result?.isError && bad.result?._meta?.code === 'INVALID_INPUT',
    `got ${JSON.stringify(bad.result)}`);
} finally {
  proc.kill('SIGINT');
  await delay(200);
}

console.log(failures === 0 ? '\nNPM smoke: PASS' : `\nNPM smoke: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
