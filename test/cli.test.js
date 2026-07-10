const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '..');
const cliPath = path.join(repoRoot, 'cli.js');

function makeTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function writeFakeOpenspec(binDir, logPath) {
  const scriptPath = path.join(binDir, 'openspec.cmd');
  const script = `@echo off
setlocal
echo %*>> "${logPath}"
if "%~1"=="--version" exit /b 0
if "%~1"=="config" (
  if "%~2"=="get" (
    if "%~3"=="profile" (
      echo custom
      exit /b 0
    )
    if "%~3"=="delivery" (
      echo both
      exit /b 0
    )
    if "%~3"=="workflows" (
      echo ["propose","explore","new","continue","apply","ff","sync","archive","bulk-archive","verify"]
      exit /b 0
    )
  )
)
if "%~1"=="init" (
  if not exist openspec mkdir openspec
  exit /b 0
)
if "%~1"=="schemas" (
  echo superspec (project)
  exit /b 0
)
if "%~1"=="validate" exit /b 0
exit /b 1
`;

  fs.writeFileSync(scriptPath, script);
}

test('running init subcommand without arguments uses openspec init flow instead of help output', () => {
  const projectDir = makeTempDir('superspec-cli-project-');
  const binDir = makeTempDir('superspec-cli-bin-');
  const logPath = path.join(projectDir, 'openspec.log');

  writeFakeOpenspec(binDir, logPath);

  const result = spawnSync(process.execPath, [cliPath, 'init'], {
    cwd: projectDir,
    env: {
      ...process.env,
      PATH: `${binDir};${process.env.PATH || ''}`
    },
    encoding: 'utf8'
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Setting up superspec/i);
  assert.doesNotMatch(result.stdout, /^Usage:/m);

  const installedConfig = fs.readFileSync(
    path.join(projectDir, 'openspec', 'config.yaml'),
    'utf8'
  );
  assert.equal(installedConfig, 'schema: superspec\n');

  const installedSkill = path.join(
    projectDir,
    '.codex',
    'skills',
    'superspec-next',
    'SKILL.md'
  );
  assert.ok(fs.existsSync(installedSkill), 'project skills should be installed');

  const fakeLog = fs.readFileSync(logPath, 'utf8');
  assert.match(fakeLog, /init --profile custom/i);
});

test('running without subcommand prints usage and exits before installation', () => {
  const projectDir = makeTempDir('superspec-cli-no-subcommand-project-');
  const binDir = makeTempDir('superspec-cli-no-subcommand-bin-');
  const logPath = path.join(projectDir, 'openspec.log');

  writeFakeOpenspec(binDir, logPath);

  const result = spawnSync(process.execPath, [cliPath], {
    cwd: projectDir,
    env: {
      ...process.env,
      PATH: `${binDir};${process.env.PATH || ''}`
    },
    encoding: 'utf8'
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /^Usage:/m);
  assert.match(result.stdout, /npx openspec-sp init --tools cursor/i);
  assert.ok(!fs.existsSync(logPath), 'openspec should not be invoked without a subcommand');
  assert.ok(
    !fs.existsSync(path.join(projectDir, 'openspec', 'config.yaml')),
    'missing subcommand should not install project files'
  );
});

test('help flag prints usage and exits before installation', () => {
  const projectDir = makeTempDir('superspec-cli-help-project-');
  const binDir = makeTempDir('superspec-cli-help-bin-');
  const logPath = path.join(projectDir, 'openspec.log');

  writeFakeOpenspec(binDir, logPath);

  const result = spawnSync(process.execPath, [cliPath, '--help'], {
    cwd: projectDir,
    env: {
      ...process.env,
      PATH: `${binDir};${process.env.PATH || ''}`
    },
    encoding: 'utf8'
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /^Usage:/m);
  assert.match(result.stdout, /npx openspec-sp init --tools cursor/i);
  assert.ok(!fs.existsSync(logPath), 'openspec should not be invoked for --help');
  assert.ok(
    !fs.existsSync(path.join(projectDir, 'openspec', 'config.yaml')),
    'help should not install project files'
  );
});
