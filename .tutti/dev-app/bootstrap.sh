#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${TUTTI_APP_PORT:-}" ]]; then
  echo "TUTTI_APP_PORT is required; the Tutti host allocates the app port." >&2
  exit 64
fi

if [[ ! "${TUTTI_APP_PORT}" =~ ^[0-9]+$ ]]; then
  echo "TUTTI_APP_PORT must be a numeric TCP port." >&2
  exit 64
fi

APP_HOST="${TUTTI_APP_HOST:-127.0.0.1}"
PROJECT_ROOT="$(cd "${TUTTI_APP_PACKAGE_DIR:-$(dirname "${BASH_SOURCE[0]}")}/../.." && pwd)"

: "${TUTTI_APP_NODE:?TUTTI_APP_NODE is required}"

export TUTTI_APP_HOST="$APP_HOST"
export DRAW_TOPIC_PROJECT_ROOT="$PROJECT_ROOT"
exec "$TUTTI_APP_NODE" "$PROJECT_ROOT/runtime/server.mjs"
