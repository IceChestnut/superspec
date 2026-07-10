# superspec-init

`superspec-init` is a compatibility wrapper for the newer `openspec-sp` CLI.

It preserves the historical user experience:

```bash
npx superspec-init --tools cursor
```

Internally, the wrapper forwards to:

```bash
npx openspec-sp init --tools cursor
```

You can also call the subcommand explicitly:

```bash
npx superspec-init init --tools cursor
```

## Notes

- Publish `openspec-sp` first, then publish this package.
- This package exists for backward compatibility. New documentation should prefer `openspec-sp init`.
