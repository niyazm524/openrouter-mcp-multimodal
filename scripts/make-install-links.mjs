#!/usr/bin/env node
/**
 * Generate one-click MCP install deeplinks for Kiro, Cursor, and VS Code
 * for @stabgan/openrouter-mcp-multimodal. Also decodes the deeplinks
 * currently in the README so reviewers can audit drift.
 *
 * Sources (accessed 2026-04-20):
 *   Kiro   - https://kiro.dev/docs/mcp/servers  (URL-encoded JSON in `config`)
 *   Cursor - https://docs.cursor.com/en/context/mcp + danywalls.com  (base64 JSON in `config`)
 *   VS Code- https://code.visualstudio.com/docs/copilot/chat/mcp-servers (URL-encoded JSON in query)
 */

const NAME = 'openrouter';

// Canonical server config for one-click installs.
// Kiro expects the inner value (command/args/env). Cursor expects the same
// shape. VS Code expects a {name, ...rest} shape at the top level.
const INNER = {
  command: 'npx',
  args: ['-y', '@stabgan/openrouter-mcp-multimodal'],
  env: { OPENROUTER_API_KEY: 'sk-or-v1-...' },
  disabled: false,
  autoApprove: [],
};

// --- Kiro: URL-encoded JSON ---
const kiroUrl = `https://kiro.dev/launch/mcp/add?name=${encodeURIComponent(NAME)}&config=${encodeURIComponent(
  JSON.stringify(INNER),
)}`;

// --- Cursor: base64-encoded JSON (same shape as a single mcpServers entry) ---
const cursorInner = {
  command: INNER.command,
  args: INNER.args,
  env: INNER.env,
};
const cursorB64 = Buffer.from(JSON.stringify(cursorInner), 'utf8').toString('base64');
const cursorUrl = `cursor://anysphere.cursor-deeplink/mcp/install?name=${encodeURIComponent(NAME)}&config=${cursorB64}`;

// --- VS Code: URL-encoded JSON with {name, command, args, env} at the top ---
const vscodeInner = {
  name: NAME,
  command: INNER.command,
  args: INNER.args,
  env: INNER.env,
};
const vscodeUrl = `vscode:mcp/install?${encodeURIComponent(JSON.stringify(vscodeInner))}`;
const vscodeInsidersUrl = `vscode-insiders:mcp/install?${encodeURIComponent(JSON.stringify(vscodeInner))}`;

// --- Decode the links currently in the README (from the v2 snapshot) ---
// Cursor (existing):
const existingCursorB64 =
  'eyJtY3BTZXJ2ZXJzIjogeyJvcGVucm91dGVyIjogeyJjb21tYW5kIjogIm5weCIsICJhcmdzIjogWyIteSIsICJAc3RhYmdhbi9vcGVucm91dGVyLW1jcC1tdWx0aW1vZGFsIl0sICJlbnYiOiB7Ik9QRU5ST1VURVJfQVBJX0tFWSI6ICJzay1vci12MS0uLi4ifX19fQ==';
const existingCursorDecoded = JSON.parse(
  Buffer.from(existingCursorB64, 'base64').toString('utf8'),
);
// VS Code (existing — identical base64 payload):
const existingVscodeB64 = existingCursorB64;
const existingVscodeDecoded = JSON.parse(
  Buffer.from(existingVscodeB64, 'base64').toString('utf8'),
);

console.log('=== Proposed one-click install URLs ===\n');
console.log('Kiro:   ', kiroUrl);
console.log('Cursor: ', cursorUrl);
console.log('VS Code:', vscodeUrl);
console.log('VS Code Insiders:', vscodeInsidersUrl);

console.log('\n=== Decoded payloads (for audit) ===\n');
console.log('Kiro config (URL-encoded JSON decodes to):');
console.log(JSON.stringify(INNER, null, 2));
console.log('\nCursor config (base64 decodes to):');
console.log(JSON.stringify(cursorInner, null, 2));
console.log('\nVS Code payload (URL-encoded JSON):');
console.log(JSON.stringify(vscodeInner, null, 2));

console.log('\n=== Existing README deeplink audit ===\n');
console.log('Existing Cursor + VS Code base64 payload decodes to:');
console.log(JSON.stringify(existingCursorDecoded, null, 2));
console.log('\nIssue: the existing payload is wrapped in {"mcpServers":{...}}.');
console.log('Cursor expects just the server body (command/args/env).');
console.log("VS Code expects {name, command, args, env} at the top, NOT {mcpServers:...}.");
console.log('Both existing links were therefore broken.');
