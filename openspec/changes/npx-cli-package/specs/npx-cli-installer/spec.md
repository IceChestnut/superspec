# npx-cli-installer

npx 可执行包，一键将 superspec schema 安装到 OpenSpec 项目中。

## ADDED Requirements

### Requirement: Pre-flight environment validation

CLI SHALL verify that the `openspec` binary is installed and that the global OpenSpec
configuration matches superspec requirements before proceeding with project installation.

#### Scenario: openspec binary not found

- **WHEN** the `openspec` command is not available on the system PATH
- **THEN** CLI SHALL exit with a non-zero status code and print an error message containing
  install instructions (`brew install openspec` and a link to the OpenSpec installation docs)

#### Scenario: Global config already correct

- **WHEN** `openspec config get profile` returns `custom`, `openspec config get delivery`
  returns `both`, and `openspec config get workflows` contains all ten required workflows
  (`propose`, `explore`, `new`, `continue`, `apply`, `ff`, `sync`, `archive`,
  `bulk-archive`, `verify`)
- **THEN** CLI SHALL proceed to project installation without any prompt or output about
  global configuration

#### Scenario: Global config incomplete — user accepts auto-fix

- **WHEN** any of `profile`, `delivery`, or `workflows` does not match the required state
- **THEN** CLI SHALL display a diff of current vs required values for each mismatched item
  and ask the user whether to fix automatically
- **AND** if the user confirms (accepts default `Y`), CLI SHALL run the equivalent of
  `openspec config set profile custom`, `openspec config set delivery both`, and update
  `workflows` to the required set in `config.json`
- **AND** then proceed to project installation

#### Scenario: Global config incomplete — user declines

- **WHEN** the user declines the auto-fix prompt (enters `n`)
- **THEN** CLI SHALL print a warning that global config is not set up and MAY cause issues
- **AND** proceed to project installation

### Requirement: One-command project installation

CLI SHALL install the superspec schema into the current working directory's OpenSpec
project by executing `openspec init`, copying the bundled schema files, setting the
default schema, and running verification — all in a single invocation.

#### Scenario: Fresh installation with explicit harness

- **WHEN** the user runs the CLI with `--tools cursor` in a git repository that has no
  `openspec/` directory
- **THEN** CLI SHALL run `openspec init --tools cursor --profile custom`
- **AND** copy all files from the bundled `openspec/schemas/superspec/` directory into
  `<cwd>/openspec/schemas/superspec/`
- **AND** write `schema: superspec` to `<cwd>/openspec/config.yaml` (creating the file
  if it does not exist)
- **AND** run `openspec schemas`, verifying that `superspec (project)` appears in the
  output
- **AND** run `openspec validate --all`
- **AND** print a success summary with next-step instructions

#### Scenario: Fresh installation without --tools flag

- **WHEN** the user runs the CLI without the `--tools` flag in a git repository
- **THEN** CLI SHALL run `openspec init --profile custom` (no `--tools` argument)
  allowing openspec's interactive TUI to handle harness selection
- **AND** continue with the remaining installation steps (copy schema, set config, verify)

#### Scenario: Schema already the default

- **WHEN** `openspec/config.yaml` already contains `schema: superspec`
- **THEN** CLI SHALL detect this and skip the config overwrite, printing a "already set"
  message

#### Scenario: Non-superspec schema already configured

- **WHEN** `openspec/config.yaml` contains a schema line other than `superspec` (e.g.,
  `schema: spec-driven`)
- **THEN** CLI SHALL print the current schema value, warn that it will be overwritten,
  then write `schema: superspec` to the file

#### Scenario: Schema files already present — overwrite

- **WHEN** `openspec/schemas/superspec/` already exists from a previous installation
- **THEN** CLI SHALL overwrite all files with the bundled version, ensuring the schema
  is up to date

#### Scenario: Verification failure

- **WHEN** `openspec validate --all` returns a non-zero exit code (excluding the
  "Nothing to validate" case which is normal for a fresh project)
- **THEN** CLI SHALL report the failure and print the openspec output for the user
  to diagnose, but SHALL NOT exit with an error (installation is structurally complete)

### Requirement: Help and usage display

CLI SHALL display usage information when invoked with `--help`, `-h`, or no arguments.

#### Scenario: Help flag

- **WHEN** the user runs the CLI with `--help` or `-h`
- **THEN** CLI SHALL print the package banner, usage syntax, description of the
  `--tools` option with available harness values, an example invocation, and a
  pointer to next steps (`/opsx:new`, `/opsx:ff`, `/opsx:apply`)

#### Scenario: No arguments

- **WHEN** the user runs the CLI with no arguments
- **THEN** CLI SHALL print the same help output as `--help`
