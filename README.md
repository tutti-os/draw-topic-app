# DecideDeck

DecideDeck is a local-first Tutti workspace app inspired by
[todaycard.app](https://todaycard.app/). Ask a small everyday question, deal five
choice cards, then click cards yourself to reveal playful answers one by one.

## Features

- Question input with an idle state matching the reference prompt bar.
- Dealing state that calls the Tutti runtime agent protocol through
  `$TUTTI_CLI` when available.
- User-controlled reveal: click a card to flip only that card.
- Image-viewer-style movement: the clicked card slides into the main position
  while the others move aside.
- Local fallback answers when running outside Tutti or when the agent is not
  available.
- English and Simplified Chinese UI.
- Tutti Load unpacked wrapper and production package builder.

## Development

```bash
corepack enable
pnpm install
pnpm dev
```

Then open the printed local URL.

For Tutti Desktop local debugging, load either this repository root or
`.tutti/dev-app/` through App Center's Load unpacked flow.

## Packaging

```bash
pnpm check:i18n
pnpm package:tutti
```

The package is written to:

```text
build/tutti-app/package
```

The package contains `tutti.app.json`, `bootstrap.sh`, `server.py`,
`card_agent.py`, static assets, icon, and localized metadata.

## Release

Production and staging GitHub Actions call Tutti's reusable app release
workflow. Configure the required repository or organization variables described
in `.github/workflows/publish-tutti-app.yml` before publishing.
