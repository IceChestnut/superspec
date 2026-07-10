## 1. 包基础结构

- [x] 1.1 创建 `package.json` — 包名改为 `openspec-sp`，bin 入口改为子命令式 CLI，并维护 files 白名单
- [x] 1.2 创建 `.npmignore` — 排除 docs/、.git/ 等

## 2. CLI 核心安装流程

- [x] 2.1 实现 `--help` / `-h` → 显示 banner + usage；裸命令显示帮助，`init` 子命令进入安装流程
- [x] 2.2 实现 Step 1：`openspec-sp init` 触发 `openspec init --profile custom`（有 `--tools <h>` 时追加 `--tools <h>`；无则进入 openspec TUI）
- [x] 2.3 实现 Step 2：将包内嵌 schema 复制到 `<cwd>/openspec/schemas/superspec/`
- [x] 2.4 实现 Step 3：将包内嵌项目级 skills 复制到 `<cwd>/.codex/skills/`
- [x] 2.5 实现 Step 4：写入 `openspec/config.yaml`（`schema: superspec`），已存在时区分已设置 / 不同 schema 两种情况
- [x] 2.6 实现 Step 5：运行 `openspec schemas` + `openspec validate --all`，打印成功摘要

## 3. 预检与环境验证

- [x] 3.1 检查 `openspec` 二进制是否可执行，不存在则报错退出（含安装指引）
- [x] 3.2 检查全局配置：读取 `openspec config get profile`，不为 `custom` 则记录差异
- [x] 3.3 检查全局配置：读取 `openspec config get delivery`，不为 `both` 则记录差异
- [x] 3.4 检查全局配置：读取 `openspec config get workflows`，缺少任一必需工作流则记录差异
- [x] 3.5 全局配置有差异时：展示当前 vs 期望对比，询问用户是否自动修复（Y/n）
- [x] 3.6 用户确认自动修复：执行 `openspec config set` 命令 + 直接写入 `config.json` 的 workflows 数组
- [x] 3.7 用户拒绝或已就绪：继续进入核心安装流程（见任务组 2）

## 4. 验证与发布准备

- [x] 4.1 本地测试：在临时 git 仓库中运行 `node cli.js init --tools opencode`，确认全流程通过并安装 project skills
- [x] 4.2 本地测试：运行 `node cli.js`（无子命令），确认显示帮助；运行 `node cli.js init`（无 `--tools`），确认进入 openspec TUI
- [x] 4.3 本地测试：模拟全局配置缺失场景，确认自动修复交互正常
- [x] 4.4 运行 `npm pack --dry-run`，确认包内容正确
- [ ] 4.5 `npm publish` 发布到 npm registry（由用户手动完成）
