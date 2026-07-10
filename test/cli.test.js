const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeArgs, runWrapper } = require('../cli.js');

test('normalizeArgs prepends init when omitted', () => {
  assert.deepEqual(normalizeArgs(['--tools', 'cursor']), ['init', '--tools', 'cursor']);
});

test('normalizeArgs preserves explicit init', () => {
  assert.deepEqual(normalizeArgs(['init', '--tools', 'cursor']), ['init', '--tools', 'cursor']);
});

test('runWrapper forwards to openspec-sp cli with normalized args', () => {
  const calls = [];

  const status = runWrapper(['--tools', 'cursor'], {
    resolveCli: () => 'C:\\fake\\openspec-sp\\cli.js',
    spawn: (...args) => {
      calls.push(args);
      return { status: 0 };
    }
  });

  assert.equal(status, 0);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], process.execPath);
  assert.deepEqual(calls[0][1], [
    'C:\\fake\\openspec-sp\\cli.js',
    'init',
    '--tools',
    'cursor'
  ]);
});
