<p align="center">
  <img src="docs/assets/superspec-logo.png" alt="Superspec - 结合 Superpowers 的规范驱动开发" width="640">
</p>

<p align="center">
  将 <a href="https://github.com/Fission-AI/OpenSpec">OpenSpec</a> 的变更治理与 <a href="https://github.com/obra/superpowers">Superpowers</a> 的执行纪律结合起来，让一次变更从想法、规范到 TDD 验证后的代码都可追踪。
</p>

<p align="center">
  MIT 协议 · Schema v4 · 需要 OpenSpec + Superpowers
</p>

<p align="center">
  <a href="README.md">English</a> · <a href="README.zh-CN.md">简体中文</a>
</p>

---

## Superspec 是什么

Superspec 是 OpenSpec 和 Superpowers 的集成方案，以 OpenSpec 负责变更状态、规范产物和生命周期治理，以 Superpowers 提供头脑风暴、计划、TDD、子代理协作和代码审查等执行能力。

OpenSpec 管理提案、能力增量规范、任务和归档；Superpowers 管理实现阶段的工程纪律。两者可以通过当前的 `superspec` schema 组成一条强引导工作流，也可以在保留原生 OpenSpec 语义的前提下，按需使用 Superspec 增强 skill。

## 两种工作模式

### 强引导模式

使用项目内置的 `superspec` schema，默认将 OpenSpec 产物治理和 Superpowers 执行流程串联起来，适合希望采用完整规范驱动开发流程的项目。

### 兼容模式

保留原生 OpenSpec skill 的语义，再显式选择 Superspec 增强入口：

```text
openspec-explore            # 原生开放式探索
superspec-brainstorm        # 可选的结构化头脑风暴
openspec-propose            # 原生提案流程
openspec-continue-change    # 原生产物推进
superspec-plan              # 可选的微任务计划
openspec-apply-change       # 原生实现流程
superspec-apply-change      # 可选的 worktree/TDD/审查增强实现
openspec-verify-change      # 原生验证门禁
superspec-finalize          # 可选的增强收尾
openspec-archive-change     # 原生归档和规范同步
superspec-next              # 不确定下一步时使用的状态路由器
```

详细说明请阅读 [兼容模式文档](docs/compatibility-mode.md) 和 [兼容模式示例](docs/compatibility-walkthrough.md)。

## 安装

先安装 [OpenSpec](https://github.com/Fission-AI/OpenSpec/blob/main/docs/installation.md) 和 [Superpowers](https://github.com/obra/superpowers#installation)。

在目标 Git 项目根目录运行：

```bash
npx openspec-sp init --tools cursor
# 或让 OpenSpec 交互式选择工具：
npx openspec-sp init
```

`openspec-sp init` 是增强版的 `openspec init`，会完成以下工作：

- 初始化 OpenSpec；
- 安装内置的 `superspec` schema；
- 将项目级 Superspec skill 安装到 `.codex/skills/`；
- 设置 `superspec` 为当前项目的默认 schema；
- 检查并配置所需的 OpenSpec 全局设置；
- 执行基础验证。

## 快速开始

以下命令应在 Agent harness 中执行，而不是普通 shell 中执行。具体斜杠命令由 harness 提供：

```text
/opsx:new my-feature
/opsx:continue
/opsx:apply
/opsx:verify
/opsx:continue        # 进入 finalize
/opsx:archive
```

对于小型且目标明确的变更，可以使用快速流程：

```text
/opsx:ff my-feature
/opsx:apply
/opsx:verify
/opsx:continue
/opsx:archive
```

如果某个变更希望使用上游的 `spec-driven` schema，可以显式指定：

```text
/opsx:new my-simple-fix --schema spec-driven
```

## 文档

- [工作流总览](docs/workflow.md)
- [工作流详细说明](docs/workflow-details.md)
- [兼容模式](docs/compatibility-mode.md)
- [兼容模式示例](docs/compatibility-walkthrough.md)
- [项目目录结构](docs/project-layout.md)
- [Schema 说明](openspec/schemas/superspec/README.md)
- [Schema 集成文档](openspec/schemas/superspec/INTEGRATION.md)

## Credits

Superspec 基于 [JiangWay/OpenSpec 的 `schemas/sdd-plus-superpowers`](https://github.com/JiangWay/OpenSpec/tree/main/schemas/sdd-plus-superpowers)，该项目最初将 OpenSpec 的规范驱动流程与 Superpowers 的执行 skill 结合起来。本仓库在此基础上继续维护，并增加了兼容模式、显式增强 skill 和 `openspec-sp` CLI 工具。

## License

本项目采用 [MIT License](LICENSE)。上游版权归属和许可证声明保留在 LICENSE 文件中；本仓库的原创和修改部分版权归 `IceChestnut` 所有。
