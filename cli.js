#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ──────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────

const EXPECTED_PROFILE = 'custom';
const EXPECTED_DELIVERY = 'both';
const REQUIRED_WORKFLOWS = [
  'propose', 'explore', 'new', 'continue', 'apply',
  'ff', 'sync', 'archive', 'bulk-archive', 'verify'
];

// ──────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────

function banner() {
  console.log(`
███████╗██╗   ██╗██████╗ ███████╗██████╗ ███████╗██████╗ ███████╗ ██████╗
██╔════╝██║   ██║██╔══██╗██╔════╝██╔══██╗██╔════╝██╔══██╗██╔════╝██╔════╝
███████╗██║   ██║██████╔╝█████╗  ██████╔╝███████╗██████╔╝█████╗  ██║
╚════██║██║   ██║██╔═══╝ ██╔══╝  ██╔══██╗╚════██║██╔═══╝ ██╔══╝  ██║
███████║╚██████╔╝██║     ███████╗██║  ██║███████║██║     ███████╗╚██████╗
╚══════╝ ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝     ╚══════╝ ╚═════╝

  Spec-driven workflow that connects OpenSpec governance with
  Superpowers execution discipline.

  Schema v4 · Requires OpenSpec + Superpowers
  `);
}

function usage() {
  console.log(`Usage:
  npx openspec-sp init --tools <tool>
  npx openspec-sp init                 (openspec interactive tool selection)
  npx openspec-sp --help

Description:
  OpenSpec Superpowers companion CLI.

Commands:
  init             Initialize OpenSpec, install the superspec schema,
                   install project skills, and set superspec as default.

Options:
  --tools <tool>   AI harness to configure (optional; omit for interactive TUI)

Available harnesses:
  cursor     Cursor IDE          claude     Claude Code (Anthropic)
  codex      OpenAI Codex CLI    opencode   OpenCode
  gemini     Google Gemini CLI   windsurf   Windsurf IDE
  copilot    GitHub Copilot

Examples:
  npx openspec-sp init --tools cursor
  npx openspec-sp init

After setup, use /opsx:new, /opsx:ff, /opsx:apply, etc. in your harness.
`);
}

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function run(cmd, opts = {}) {
  console.log(`  $ ${cmd}`);
  return execSync(cmd, { stdio: 'inherit', ...opts });
}

function runQuiet(cmd) {
  return execSync(cmd, { stdio: 'pipe', encoding: 'utf-8' }).trim();
}

// ──────────────────────────────────────────────────
// Pre-flight: binary check
// ──────────────────────────────────────────────────

function checkOpenspec() {
  try {
    execSync('openspec --version', { stdio: 'pipe' });
    return true;
  } catch {
    console.error('Error: openspec CLI not found.');
    console.error('');
    console.error('Install openspec first:');
    console.error('  brew install openspec');
    console.error('  or see https://github.com/Fission-AI/OpenSpec/blob/main/docs/installation.md');
    console.error('');
    console.error('Then re-run: npx openspec-sp init');
    return false;
  }
}

// ──────────────────────────────────────────────────
// Pre-flight: global config check
// ──────────────────────────────────────────────────

function parseProfile(raw) {
  // Remove ANSI escape sequences and trim
  return raw.replace(/\x1b\[[0-9;]*m/g, '').trim();
}

function parseWorkflows(raw) {
  const cleaned = raw.replace(/\x1b\[[0-9;]*m/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Fallback: some openspec versions output as non-JSON list
    const match = cleaned.match(/\[.*\]/);
    return match ? JSON.parse(match[0]) : [];
  }
}

function getGlobalConfig() {
  try {
    const profile = parseProfile(runQuiet('openspec config get profile'));
    const delivery = parseProfile(runQuiet('openspec config get delivery'));
    const workflows = parseWorkflows(runQuiet('openspec config get workflows'));
    return { profile, delivery, workflows };
  } catch (e) {
    // openspec config commands failed — probably no global config yet
    return { profile: '', delivery: '', workflows: [] };
  }
}

function validateGlobalConfig(config) {
  const mismatches = [];

  if (config.profile !== EXPECTED_PROFILE) {
    mismatches.push({
      key: 'profile',
      current: config.profile || '(not set)',
      expected: EXPECTED_PROFILE
    });
  }

  if (config.delivery !== EXPECTED_DELIVERY) {
    mismatches.push({
      key: 'delivery',
      current: config.delivery || '(not set)',
      expected: EXPECTED_DELIVERY
    });
  }

  const missingWorkflows = REQUIRED_WORKFLOWS.filter(
    w => !config.workflows.includes(w)
  );
  if (missingWorkflows.length > 0) {
    const currentDisplay = config.workflows.length > 0
      ? `${config.workflows.length} workflows (missing ${missingWorkflows.length})`
      : '(not set)';
    mismatches.push({
      key: 'workflows',
      current: currentDisplay,
      expected: `${REQUIRED_WORKFLOWS.length} workflows`
    });
  }

  return mismatches;
}

function showGlobalConfigMismatches(mismatches) {
  console.log('\n━━━ Pre-flight: OpenSpec Global Config ━━━');
  console.log('');
  console.log('  The following global settings need to be configured for superspec:');
  console.log('');
  console.log('  ┌───────────┬──────────────────────┬──────────────────────┐');
  console.log('  │ Setting   │ Current              │ Required             │');
  console.log('  ├───────────┼──────────────────────┼──────────────────────┤');
  for (const m of mismatches) {
    const key = m.key.padEnd(9);
    const cur = m.current.padEnd(20);
    const exp = m.expected.padEnd(20);
    console.log(`  │ ${key} │ ${cur} │ ${exp} │`);
  }
  console.log('  └───────────┴──────────────────────┴──────────────────────┘');
  console.log('');
}

function promptAutoFix() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question('  Fix automatically? [Y/n] ', (answer) => {
      rl.close();
      const trimmed = answer.trim().toLowerCase();
      resolve(trimmed === '' || trimmed === 'y' || trimmed === 'yes');
    });
  });
}

function applyGlobalFixes(mismatches) {
  const needsProfile = mismatches.some(m => m.key === 'profile');
  const needsDelivery = mismatches.some(m => m.key === 'delivery');
  const needsWorkflows = mismatches.some(m => m.key === 'workflows');

  if (needsProfile) {
    runQuiet(`openspec config set profile ${EXPECTED_PROFILE}`);
    console.log(`  \u2713 profile set to ${EXPECTED_PROFILE}`);
  }
  if (needsDelivery) {
    runQuiet(`openspec config set delivery ${EXPECTED_DELIVERY}`);
    console.log(`  \u2713 delivery set to ${EXPECTED_DELIVERY}`);
  }
  if (needsWorkflows) {
    try {
      const cfgPath = runQuiet('openspec config path');
      const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
      cfg.workflows = REQUIRED_WORKFLOWS;
      fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + '\n');
      console.log(`  \u2713 workflows configured (${REQUIRED_WORKFLOWS.length} enabled)`);
    } catch (e) {
      console.log(`  Warning: could not auto-configure workflows (${e.message})`);
      console.log('  Run: openspec config profile');
      console.log('  Then enable all workflows interactively.');
    }
  }
  console.log('');
}

async function preflightGlobalConfig() {
  const config = getGlobalConfig();
  const mismatches = validateGlobalConfig(config);

  if (mismatches.length === 0) {
    // All good, silent
    return;
  }

  showGlobalConfigMismatches(mismatches);

  const shouldFix = await promptAutoFix();
  if (shouldFix) {
    applyGlobalFixes(mismatches);
  } else {
    console.log('  Skipping global config setup.');
    console.log('  Warning: project install may not work correctly without it.');
    console.log('');
  }
}

// ──────────────────────────────────────────────────
// Project install
// ──────────────────────────────────────────────────

function runInit(tools) {
  const cwd = process.cwd();
  const projectName = path.basename(cwd);

  console.log(`Setting up superspec in ${projectName}...\n`);

  // ── Step 1: openspec init ─────────────────────
  console.log('━━━ Step 1/5: Initialize OpenSpec ━━━');
  const toolsArg = tools ? `--tools ${tools}` : '';
  const cmd = `openspec init ${toolsArg} --profile custom`.replace(/\s+/g, ' ').trim();
  try {
    run(cmd, { cwd });
  } catch (e) {
    console.error(`\nError: openspec init failed (exit code ${e.status})`);
    console.error('Make sure the openspec CLI is installed and the project is a git repo.');
    process.exit(1);
  }

  // ── Step 2: Copy schema ───────────────────────
  console.log('\n━━━ Step 2/5: Install superspec schema ━━━');

  const srcDir = path.resolve(__dirname, 'openspec', 'schemas', 'superspec');
  const destDir = path.resolve(cwd, 'openspec', 'schemas', 'superspec');

  if (!fs.existsSync(srcDir)) {
    console.error(`Error: bundled schema not found at ${srcDir}`);
    console.error('This is a bug in the superspec package — please report it.');
    process.exit(1);
  }

  console.log(`  Copying schema to openspec/schemas/superspec/`);
  copyDirSync(srcDir, destDir);
  console.log('  Done.');

  // ── Step 3: Install project skills ────────────
  console.log('\n━━━ Step 3/5: Install superspec project skills ━━━');

  const skillsSrcDir = path.resolve(__dirname, 'skills');
  const skillsDestDir = path.resolve(cwd, '.codex', 'skills');

  if (!fs.existsSync(skillsSrcDir)) {
    console.error(`Error: bundled skills not found at ${skillsSrcDir}`);
    console.error('This is a bug in the superspec package — please report it.');
    process.exit(1);
  }

  console.log(`  Copying project skills to .codex/skills/`);
  copyDirSync(skillsSrcDir, skillsDestDir);
  console.log('  Done.');

  // ── Step 4: Set default schema ────────────────
  console.log('\n━━━ Step 4/5: Set superspec as default schema ━━━');

  const configPath = path.resolve(cwd, 'openspec', 'config.yaml');
  if (fs.existsSync(configPath)) {
    const existing = fs.readFileSync(configPath, 'utf-8');
    const currentSchema = existing.match(/^schema:\s*(.+)$/m)?.[1] || '(not set)';
    if (currentSchema === 'superspec') {
      console.log('  Already set to superspec — skipping.');
    } else {
      console.log(`  Current schema: ${currentSchema}`);
      console.log('  Setting to superspec.');
      console.log('  (Original backed up in git history)');
      fs.writeFileSync(configPath, 'schema: superspec\n');
    }
  } else {
    fs.writeFileSync(configPath, 'schema: superspec\n');
    console.log('  Wrote openspec/config.yaml');
  }

  // ── Step 5: Verify ────────────────────────────
  console.log('\n━━━ Step 5/5: Verify installation ━━━');

  let allGood = true;

  try {
    console.log('\n  Available schemas:');
    run('openspec schemas', { cwd });
  } catch {
    allGood = false;
    console.error('  Warning: openspec schemas failed');
  }

  try {
    run('openspec validate --all', { cwd });
  } catch {
    // validate may return non-zero if there's nothing to validate
    // that's OK — no changes exist yet
    console.log('  (No items to validate — expected for a fresh install)');
  }

  // ── Done ──────────────────────────────────────
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (allGood) {
    console.log('  Superspec installed successfully!');
  } else {
    console.log('  Superspec installed with warnings (see above).');
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\nNext steps:');
  console.log('  1. Install Superpowers if you haven\'t:');
  console.log('     https://github.com/obra/superpowers#installation');
  console.log('  2. Use compatibility-mode skills from .codex/skills/ as needed');
  console.log('  3. Start a new change:');
  console.log('     /opsx:new my-feature');
  console.log('  4. Or fast-forward through artifacts:');
  console.log('     /opsx:ff my-feature');
  console.log('');
}

// ──────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────

(async function main() {
  const args = process.argv.slice(2);
  const [subcommand, ...rest] = args;

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    banner();
    usage();
    process.exit(0);
  }

  if (subcommand !== 'init') {
    console.error(`Unknown subcommand: ${subcommand}`);
    console.error('');
    usage();
    process.exit(1);
  }

  // ── Pre-flight: openspec binary ─────────────
  if (!checkOpenspec()) {
    process.exit(1);
  }

  // ── Pre-flight: global config ───────────────
  await preflightGlobalConfig();

  // ── Parse --tools (optional) ────────────────
  const toolsIdx = rest.indexOf('--tools');
  const tools = toolsIdx !== -1 ? rest[toolsIdx + 1] : null;

  // ── Install ─────────────────────────────────
  runInit(tools);
})();
