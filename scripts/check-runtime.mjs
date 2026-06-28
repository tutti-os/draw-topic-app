import assert from "node:assert/strict";

import {
  CHOICES,
  fallbackCards,
  normalizeCards,
  parseCardsJson,
  selectProvider
} from "../runtime/card-agent.mjs";

const providers = [
  { id: "claude", available: false },
  { id: "codex", available: true }
];

assert.equal(selectProvider(providers, "codex")?.id, "codex");
assert.equal(selectProvider(providers, "claude")?.id, "codex");
assert.equal(selectProvider([{ id: "claude", available: false }], "")?.id, undefined);

assert.equal(fallbackCards("今天吃什么", "zh-CN").length, CHOICES.length);
assert.equal(
  parseCardsJson('```json\n{"cards":[{"answer":"a"},{"answer":"b"},{"answer":"c"},{"answer":"d"},{"answer":"e"}]}\n```')?.length,
  CHOICES.length
);
assert.equal(
  normalizeCards([{ answer: "anything" }], "今天吃什么", "en")[0].choice,
  "A"
);

console.log("runtime checks passed");
