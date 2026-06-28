# Requirements

## Goal

Build DecideDeck, a standalone third-party Tutti Web app that captures the core flow of
todaycard.app: enter a question, deal five choice cards, then let the user click
cards to reveal answers one by one.

## User Experience

- The first screen shows the DecideDeck title, five unrevealed floating cards,
  and a large bottom question input.
- A user enters a question and clicks the draw button.
- The app enters a dealing state, detects available Claude Code and Codex
  providers through `@tutti-os/agent-acp-kit`, and requests card answers from
  the selected provider.
- Dealing has a minimum visible duration of 3 seconds. If agent generation does
  not finish within 180 seconds, the server falls back to local card answers.
  The browser request waits up to 210 seconds so it can receive that fallback.
- Card dot-matrix artwork stays stable while the user types, animates only
  during dealing as a loading effect, then freezes into meaningful glyphs
  selected from the agent result or semantic fallback.
- Card colors are result-aware rather than purely random: the agent may return
  a `tone`, and the UI falls back to semantic tone mapping from the answer and
  pattern. Dealing may use temporary color motion, but final colors stay fixed.
- After dealing, every card stays unrevealed until the user clicks it.
- Clicking a card reveals only that card and moves it into the main position,
  while the other cards slide aside like an image viewer.
- Clicking another card reveals that card and changes the main position.
- Clicking the bottom button after dealing resets the spread for a new draw.
- The app should visually match the supplied reference screenshots: white
  background, soft green corner glow, rounded outlined cards, dot-matrix card
  artwork, and black pill button.
- Card headers show the DecideDeck name only; no `.app` suffix or decorative
  serial number is shown on the card face.

## Tutti App Behavior

- App id: `draw-topic-app`.
- Source manifest lives at repository root as `tutti.app.json`.
- Local debug wrapper lives under `.tutti/dev-app`.
- Production package output lives under `build/tutti-app/package`.
- Healthcheck path is `/healthz`.
- In-app copy is localized through `locales/<locale>/app.json`.
- Manifest metadata has Simplified Chinese localization.

## Non-Goals

- No network calls to todaycard.app.
- No cloud sync.
- No user accounts.
- No daemon API integration.
- No CLI commands for v0.1.0.
