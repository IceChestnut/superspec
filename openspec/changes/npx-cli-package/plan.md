# npx-cli-package Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development
> to implement this plan task-by-task.

**Goal:** 补齐 CLI 的预检逻辑（全局配置检测 + 询问式自动修复）和 `--tools` 可选支持，发布到 npm。

**Architecture:** 单文件 Node.js CLI（`cli.js`），零依赖。核心流程：预检 → 全局配置修复（可选）→ openspec init → 复制 schema → 写 config → 验证。

**Tech Stack:** Node.js 内置模块（`fs`, `path`, `child_process`, `readline`）

---

## Task 1: openspec 二进制检查 + --tools 可选

**对应 tasks.md**: 3.1, 2.2（改进）

- [ ] **Step 1:** 重构 `checkOpenspec()`，改为 `execSync('openspec --version', { stdio: 'pipe' })` 确认二进制存在，失败时打印含 `brew install openspec` 链接的错误并 `process.exit(1)`
- [ ] **Step 2:** 修改 `--tools` 解析：去掉必填校验和 `process.exit(1)`，改为条件拼接。无 `--tools` 时构造命令 `openspec init --profile custom`，有则追加 `--tools <value>`
- [ ] **Step 3:** 在临时 git 仓库中测试 `node cli.js`（无 `--tools`），确认 openspec TUI 正常弹出；测试 `node cli.js --tools opencode` 确认直接跳过 TUI

## Task 2: 全局配置状态读取

**对应 tasks.md**: 3.2, 3.3, 3.4

- [ ] **Step 1:** 新增函数 `getGlobalConfig()`，用 `execSync` 分别执行 `openspec config get profile`、`openspec config get delivery`、`openspec config get workflows`，解析 JSON/stdout 返回 `{ profile, delivery, workflows }` 对象。注意 `workflows` 是 JSON 数组字符串，需 `JSON.parse`
- [ ] **Step 2:** 新增函数 `validateConfig(config)`，定义期望值常量：`EXPECTED_PROFILE = 'custom'`、`EXPECTED_DELIVERY = 'both'`、`REQUIRED_WORKFLOWS = ["propose", "explore", "new", "continue", "apply", "ff", "sync", "archive", "bulk-archive", "verify"]`，返回缺失项列表 `[{ key, current, expected }]`
- [ ] **Step 3:** 在 `runInit()` 开头调用 `validateConfig`，如全部就绪则无输出直接进入安装流程；有缺失则调用任务 3 的交互函数

## Task 3: 全局配置交互式修复

**对应 tasks.md**: 3.5, 3.6, 3.7

- [ ] **Step 1:** 新增函数 `promptAutoFix(mismatches)`，打印格式化的差异表格（每行显示 key / current / expected），输出 `Fix automatically? [Y/n]` 并用 `readline` 监听单次按键
- [ ] **Step 2:** 新增函数 `applyFixes(mismatches)`，对 profile/delivery 调用 `execSync('openspec config set <key> <value>')`，对 workflows 直接读取 `openspec config path` 得到的 `config.json`，用 `JSON.parse` / `JSON.stringify` 替换 `workflows` 字段后写回
- [ ] **Step 3:** 用户输入 `Y` 或回车 → 调用 `applyFixes` → 打印 `✓ profile set to custom` 等确认信息 → 继续安装；用户输入 `n` → 打印警告 → 继续安装
- [ ] **Step 4:** 在临时环境中模拟配置缺失：手动改 `config.json` 的 profile 为 `core`，运行 CLI 确认差异表格正确显示，Y 确认后配置被修复

## Task 4: 端到端测试 + 发布

**对应 tasks.md**: 4.1—4.5

- [ ] **Step 1:** 完整流程测试：临时 git 仓库 + `node cli.js --tools opencode`，确认预检通过 → init → 复制 → 配置 → 验证全部成功
- [ ] **Step 2:** 全局配置缺失测试：临时修改 `config.json`，运行 CLI，确认差异展示 → Y 修复 → 安装成功
- [ ] **Step 3:** 全局配置拒绝测试：临时修改 `config.json`，运行 CLI，确认差异展示 → n → 警告 → 安装仍成功
- [ ] **Step 4:** 运行 `npm pack --dry-run` 确认包内容仅含 `cli.js`、`package.json`、`LICENSE`、`README.md` 和 `openspec/schemas/superspec/`
- [ ] **Step 5:** 运行 `npm publish` 发布 `superspec-init@0.1.0` 到 npm registry
