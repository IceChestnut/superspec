#!/usr/bin/env node

const { spawnSync } = require('child_process');

function normalizeArgs(args) {
  if (args[0] === 'init') {
    return args;
  }

  return ['init', ...args];
}

function runWrapper(args, options = {}) {
  const spawn = options.spawn || spawnSync;
  const resolveCli = options.resolveCli || (() => require.resolve('openspec-sp/cli.js'));
  const normalizedArgs = normalizeArgs(args);
  const cliPath = resolveCli();

  const result = spawn(process.execPath, [cliPath, ...normalizedArgs], {
    stdio: 'inherit'
  });

  return typeof result.status === 'number' ? result.status : 1;
}

if (require.main === module) {
  process.exit(runWrapper(process.argv.slice(2)));
}

module.exports = {
  normalizeArgs,
  runWrapper
};
