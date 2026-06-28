# Agent Instructions

This repository follows the Tutti OS organization contribution guide:

https://github.com/tutti-os/.github/blob/main/CONTRIBUTING.md

When working in this repository, agents must:

- Keep changes focused and avoid unrelated refactors.
- Prefer a conventional commit style PR title when opening or updating a PR.
- Fill in the PR description with test evidence, risk notes, and AI/LLM
  assistance disclosure when relevant.
- Follow repository-specific notes below.

Before finishing a change, agents must check:

- `git diff`
- relevant tests, or a clear reason tests were not run
- whether the PR title follows `type(scope): summary` or `type: summary`

## Repository-Specific Notes

This repository is a standalone Tutti workspace app.

## Shape

- `src/` owns the browser UI.
- `locales/` owns manifest metadata localization and in-app copy.
- `public/` owns static assets used by source and packaged builds.
- `runtime/` owns the packaged Node HTTP server, agent runtime, and bootstrap script.
- `.tutti/dev-app/` is the Load unpacked local debug wrapper.
- `scripts/package-tutti-app.mjs` builds `build/tutti-app/package`.

Keep the app local-first and inspectable. Do not add remote services, accounts,
or framework dependencies unless a future requirement truly needs them.

## Tutti Runtime Rules

- `bootstrap.sh` must read host-injected `TUTTI_APP_HOST` and
  `TUTTI_APP_PORT`; it must fail if the port is missing.
- Runtime package files are read-only.
- Browser state uses `localStorage`.
- `GET /api/providers` detects available Claude Code and Codex providers through
  `@tutti-os/agent-acp-kit`.
- `POST /api/draw` uses `@tutti-os/agent-acp-kit` from the Node server for
  app-owned local agent execution. It must keep a local fallback for ordinary
  browser development and agent/runtime failures.
- If backend persistence is added later, write durable state only under
  `$TUTTI_APP_DATA_DIR`.
- Read locale from `window.tuttiExternal.app` with browser locale fallback.
- Use `prefers-color-scheme` for theme.

## Validation

Before finishing changes, run:

```bash
pnpm check:i18n
pnpm check:runtime
pnpm package:tutti
```

If the Tutti repository is available, also run its package validator against
`build/tutti-app/package`.
