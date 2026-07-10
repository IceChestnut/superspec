## Why

OpenSpec 的 superspec schema 安装需要多个手动步骤：克隆仓库、复制 schema 文件到项目、写入 config.yaml、运行 `openspec init`。README 中的安装脚本是 Unix bash，Windows 用户无法直接使用。这导致安装过程容易出错，阻碍了 superspec 的推广采用。与此同时，如果未来还要承载更多 OpenSpec 相关命令，CLI 也需要从单一安装器演进为带子命令的工具。

现在的情况是：每次在新项目中使用 superspec，用户需要找到文档、复制粘贴命令、手动调整路径——整个过程约需 2-3 分钟且容易遗漏步骤。

## What Changes

将 superspec schema 打包为 npm 可执行包（`openspec-sp`），用户通过 `npx openspec-sp init --tools <harness>` 一条命令完成全部安装。CLI 采用子命令结构，为后续扩展其他 OpenSpec 相关命令预留空间。`init` 子命令分两个阶段：

**阶段 0：预检 + 全局配置（一次性）**

执行项目安装前，先检查 OpenSpec 全局配置是否就绪：
- `openspec config get profile` → 需为 `custom`
- `openspec config get delivery` → 需为 `both`
- `openspec config get workflows` → 需包含全部十个工作流

若缺失，展示当前状态 vs 期望状态，询问用户是否自动修复。用户可接受（自动补齐）或拒绝（跳过，但给出警告）。已就绪则静默通过。

**阶段 1：项目安装（每次）**

1. 运行 `openspec init --profile custom`（有 `--tools <h>` 则追加 `--tools <h>`；无则进入 openspec 交互式 TUI 选择 harness）
2. 将包内嵌的 `openspec/schemas/superspec/` 复制到目标项目
3. 将包内嵌的项目级 `skills/` 复制到目标项目 `.codex/skills/`
4. 写入 `openspec/config.yaml`（`schema: superspec`），覆盖时给出提示
5. 运行 `openspec schemas` 和 `openspec validate --all` 验证

**安装前**：手动 2-3 分钟，多步操作，Unix 脚本不跨平台。
**安装后**：一行命令，5 秒完成，Windows / macOS / Linux 全平台支持。

零运行时依赖，仅使用 Node.js 内置模块（`fs`、`path`、`child_process`）。

## Capabilities

### New Capabilities
- `npx-cli-installer`: npm 包 `openspec-sp`，提供 `npx openspec-sp init --tools <harness>` 命令，一键将 superspec schema 和项目级 skills 安装到任何 OpenSpec 项目中

## Impact

- 新增文件：`package.json`、`cli.js`、`.npmignore`（项目根目录）
- 修改现有文件：`README.md`（安装方式更新为 `npx openspec-sp init` 主路径），并同步 CLI / spec 文案对齐
- 无 API 变更，无破坏性变更
- 发布到 npm 后，用户可以 `npx openspec-sp init --tools cursor` 替代 README 中的手动安装步骤
