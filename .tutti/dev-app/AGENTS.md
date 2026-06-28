# DecideDeck Tutti Local Debug App

This directory is the Tutti Load unpacked wrapper for the source project at
`../..`. Keep it small: it contains only the Tutti host contract, launch script,
and local debug metadata.

## Runtime

- Tutti Desktop may load either the project root or `.tutti/dev-app/`.
- `bootstrap.sh` is the runtime entrypoint and takes no arguments.
- The script requires `TUTTI_APP_PORT` and uses `TUTTI_APP_HOST`, defaulting the
  host to `127.0.0.1`.
- The source app is served by `scripts/dev-server.py`.
- The wrapper uses `$TUTTI_APP_PYTHON`; do not replace it with system Python.

## Editing

- Edits under `src/`, `locales/`, and `public/` are picked up by reloading the
  app webview.
- Edits to `.tutti/dev-app/tutti.app.json`, `.tutti/dev-app/bootstrap.sh`, or
  this file require App Center's local-dev Reload action.
- Release packaging remains under `build/tutti-app/package`, not under this
  wrapper.
