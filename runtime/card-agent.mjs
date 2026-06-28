import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
  createClaudeProvider,
  createCodexProvider,
  createLocalAgentRuntime
} from "@tutti-os/agent-acp-kit";
import { loadTuttiAgentSkillContext } from "@tutti-os/agent-acp-kit/tutti";

export const CHOICES = ["A", "B", "C", "D", "E"];
export const PROVIDERS = [
  { id: "claude", label: "Claude Code", create: createClaudeProvider },
  { id: "codex", label: "Codex", create: createCodexProvider }
];

const PATTERNS = [
  "bowl",
  "fridge",
  "shop",
  "friend",
  "spark",
  "leaf",
  "home",
  "clock",
  "heart",
  "dice",
  "check",
  "wave",
  "book",
  "route",
  "coin",
  "bed",
  "laptop",
  "broom",
  "phone",
  "cart",
  "key",
  "gift",
  "coffee",
  "umbrella",
  "music",
  "movie",
  "medkit",
  "dumbbell",
  "sun",
  "moon",
  "map",
  "tool",
  "pet",
  "shirt",
  "car",
  "plane"
];
const TONES = ["coral", "cyan", "green", "gold", "orange", "violet", "blue", "rose"];
const FALLBACK_ZH = [
  "别想了，点上次那家",
  "打开冰箱，能吃的都列出来",
  "今天试个新店，踩雷也认了",
  "热乎汤面，稳稳收场",
  "吃点清爽的，给下午留余地",
  "十分钟内能到的优先",
  "选一份有蔬菜的热饭"
];
const FALLBACK_EN = [
  "Stop thinking and pick the place from last time",
  "Open the fridge and list what is actually edible",
  "Try a new place today, even if it is a miss",
  "Choose a warm bowl that feels easy",
  "Keep it light and leave room for the afternoon",
  "Pick the closest option within ten minutes",
  "Get something warm with vegetables"
];

const runtime = createLocalAgentRuntime({
  providers: PROVIDERS.map((provider) => provider.create())
});

export async function detectAgentProviders(options = {}) {
  const detected = await runtime.detect({
    cwd: options.cwd || process.env.TUTTI_WORKSPACE_ROOT || process.cwd(),
    env: process.env,
    refresh: options.refresh
  });
  const byId = new Map(detected.map((entry) => [entry.provider, entry]));
  const providers = PROVIDERS.map((provider) => {
    const entry = byId.get(provider.id);
    const result = entry?.result || null;
    const unavailableAuth = ["missing", "expired"].includes(result?.authState || "");
    const available = Boolean(result) && result.supported !== false && !unavailableAuth;
    return {
      id: provider.id,
      label: provider.label,
      available,
      version: result?.version || "",
      executablePath: result?.executablePath || "",
      authState: result?.authState || "missing",
      unsupportedReason: result?.unsupportedReason || "",
      models: Array.isArray(result?.models) ? result.models : []
    };
  });
  const defaultProvider = providers.find((provider) => provider.available)?.id || "";
  return { providers, defaultProvider };
}

export function selectProvider(providers, requestedProvider) {
  const requested = providers.find(
    (provider) => provider.id === requestedProvider && provider.available
  );
  return requested || providers.find((provider) => provider.available) || null;
}

export async function generateCards(input) {
  const question = String(input.question || "").trim();
  const locale = String(input.locale || "zh-CN");
  const errors = [];
  try {
    const detection = await detectAgentProviders({ cwd: input.cwd });
    const provider = selectProvider(detection.providers, input.provider);
    if (!provider) {
      throw new Error("No available Claude Code or Codex provider");
    }
    const { cards, metadata } = await generateCardsWithAgent({
      question,
      locale,
      provider: provider.id,
      cwd: input.cwd
    });
    return {
      ok: true,
      source: "agent-acp-kit",
      provider: provider.id,
      cards: normalizeCards(cards, question, locale),
      metadata
    };
  } catch (error) {
    errors.push(String(error?.message || error));
  }

  return {
    ok: true,
    source: "local-fallback",
    fallbackReason: errors.join("; "),
    cards: fallbackCards(question, locale)
  };
}

async function generateCardsWithAgent(input) {
  const timeoutMs = Number.parseInt(process.env.DRAW_TOPIC_AGENT_TIMEOUT_MS || "180000", 10);
  const runId = `draw-topic-${Date.now()}-${crypto.randomUUID()}`;
  const runDir = await fs.mkdtemp(path.join(os.tmpdir(), "draw-topic-agent-"));
  const prompt = buildAgentPrompt(input.question, input.locale);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const tuttiContext = await loadTuttiContext({
      provider: input.provider,
      runId,
      cwd: input.cwd || runDir
    });
    const systemPrompt = [
      "Return only the requested card JSON. Do not include markdown fences.",
      tuttiContext.recommendedSystemPrompt?.content
    ]
      .filter(Boolean)
      .join("\n\n");
    let text = "";
    let sessionId = "";
    let resumeToken = "";
    for await (const event of runtime.run({
      runId,
      provider: input.provider,
      runtimeKind: "local-agent",
      runtimeProvider: input.provider,
      cwd: runDir,
      prompt,
      systemPrompt,
      timeoutMs,
      signal: controller.signal,
      skillManifest: tuttiContext.skillManifest
    })) {
      if (event.type === "text_delta") text += event.text;
      if (event.type === "error") throw new Error(event.message);
      if (event.type === "done") {
        sessionId = event.sessionId || "";
        resumeToken = event.resumeToken || "";
      }
    }
    const cards = extractCardsFromPayload({ text });
    if (!cards) throw new Error(`${input.provider} did not return card JSON`);
    return {
      cards,
      metadata: {
        provider: input.provider,
        sessionId,
        resumeToken
      }
    };
  } finally {
    clearTimeout(timer);
    await fs.rm(runDir, { recursive: true, force: true });
  }
}

async function loadTuttiContext(input) {
  if (!process.env.TUTTI_CLI) return { skillManifest: [] };
  try {
    return await loadTuttiAgentSkillContext({
      provider: input.provider,
      agentSessionId: input.runId,
      cwd: input.cwd,
      env: process.env
    });
  } catch {
    return { skillManifest: [] };
  }
}

function buildAgentPrompt(question, locale) {
  const language = locale.toLowerCase().startsWith("zh") ? "Simplified Chinese" : "English";
  return [
    "You are the card generator for a Tutti workspace app named 抽张主意.",
    "The user typed a small everyday decision question.",
    "Generate exactly five playful choice-card answers.",
    "Return ONLY valid JSON.",
    'Schema: {"cards":[{"choice":"A","answer":"...","pattern":"bowl","tone":"gold"}]}',
    "Rules:",
    "- Keep each answer short: 8 to 18 Chinese characters, or 5 to 12 English words.",
    "- Make answers concrete, varied, and immediately actionable.",
    "- Avoid vague answers, random choice, or asking someone else unless the question asks for it.",
    "- Match the user's topic. Do not default to food unless the question is about food.",
    `- pattern must be one of: ${PATTERNS.join(", ")}.`,
    `- tone must be one of: ${TONES.join(", ")}.`,
    "- Do not mention that you are an AI.",
    "- Do not include unsafe, medical, legal, or financial advice.",
    `- Output language: ${language}.`,
    `User question: ${question}`
  ].join("\n");
}

export function extractCardsFromPayload(payload) {
  for (const text of iterText(payload)) {
    const parsed = parseCardsJson(text);
    if (parsed) return parsed;
  }
  return null;
}

export function parseCardsJson(text) {
  if (typeof text !== "string" || !text.includes('"cards"')) return null;
  const candidates = [text];
  const match = text.match(/\{[\s\S]*"cards"[\s\S]*\}/);
  if (match) candidates.push(match[0]);
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed.cards) && parsed.cards.length >= CHOICES.length) {
        return parsed.cards;
      }
    } catch {
      // Try the next candidate.
    }
  }
  return null;
}

function* iterText(value) {
  if (typeof value === "string") {
    yield value;
  } else if (Array.isArray(value)) {
    for (const item of value) yield* iterText(item);
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value)) yield* iterText(item);
  }
}

export function normalizeCards(cards, question, locale) {
  const fallback = fallbackCards(question, locale);
  const usedAnswers = new Set();
  return CHOICES.map((choice, index) => {
    const source = cards[index] && typeof cards[index] === "object" ? cards[index] : {};
    const rawAnswer = String(source.answer || source.text || "").trim();
    const fallbackAnswer = firstUnusedFallback(fallback, usedAnswers, index);
    const answer =
      rawAnswer && !isLowUtilityAnswer(rawAnswer, question) && !usedAnswers.has(compactKey(rawAnswer))
        ? rawAnswer
        : fallbackAnswer;
    const compacted = compactAnswer(answer, locale);
    usedAnswers.add(compactKey(compacted));
    return {
      choice,
      answer: compacted,
      serial: serialFor(question, choice),
      pattern: normalizePattern(source.pattern || source.patternKey || source.glyph || source.icon, question, answer, choice),
      tone: normalizeTone(source.tone || source.color || source.palette, question, answer, choice),
      patternSeed: `${question}:${choice}:${answer}`
    };
  });
}

export function fallbackCards(question, locale) {
  const pool = locale.toLowerCase().startsWith("zh") ? FALLBACK_ZH : FALLBACK_EN;
  const rng = seededShuffle(pool, stableHash(question || "decidedeck"));
  return CHOICES.map((choice, index) => {
    const answer = rng[index % rng.length];
    return {
      choice,
      answer,
      serial: serialFor(question, choice),
      pattern: normalizePattern("", question, answer, choice),
      tone: normalizeTone("", question, answer, choice),
      patternSeed: `${question}:${choice}:${answer}`
    };
  });
}

function seededShuffle(values, seed) {
  const copy = [...values];
  let state = seed || 1;
  for (let index = copy.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) % 4294967296;
    const swapIndex = state % (index + 1);
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function normalizePattern(value, question, answer, choice) {
  const key = String(value || "").toLowerCase().replace(/[^a-z]/g, "");
  if (PATTERNS.includes(key)) return key;
  const text = `${question} ${answer}`.toLowerCase();
  for (const [pattern, words] of [
    ["fridge", ["冰箱", "fridge", "剩菜"]],
    ["umbrella", ["伞", "雨", "天气", "umbrella", "rain"]],
    ["coffee", ["咖啡", "茶", "coffee", "tea"]],
    ["dumbbell", ["运动", "健身", "exercise", "gym"]],
    ["plane", ["飞机", "航班", "plane", "flight"]],
    ["movie", ["电影", "剧", "movie", "show"]],
    ["shirt", ["衣服", "穿", "clothes", "outfit"]],
    ["coin", ["预算", "钱", "budget", "money"]],
    ["key", ["钥匙", "门", "锁", "key", "lock"]],
    ["gift", ["礼物", "惊喜", "gift", "surprise"]],
    ["cart", ["买", "购物", "下单", "buy", "shopping"]],
    ["shop", ["店", "餐厅", "外卖", "restaurant", "takeout"]],
    ["phone", ["电话", "联系", "回复", "call", "text"]],
    ["friend", ["朋友", "同事", "一起", "friend", "team"]],
    ["leaf", ["清爽", "轻", "蔬", "light", "fresh"]],
    ["home", ["家", "上次", "常去", "home", "usual"]],
    ["route", ["走", "路", "通勤", "旅行", "route", "travel"]],
    ["map", ["地图", "方向", "附近", "map", "nearby"]],
    ["car", ["开车", "打车", "car", "taxi"]],
    ["book", ["学习", "读", "书", "study", "read"]],
    ["laptop", ["工作", "电脑", "邮件", "work", "email"]],
    ["bed", ["睡", "休息", "sleep", "rest"]],
    ["broom", ["收拾", "整理", "clean", "tidy"]],
    ["tool", ["修", "工具", "fix", "tool"]],
    ["medkit", ["医生", "药", "健康", "medical", "health"]],
    ["clock", ["快", "马上", "时间", "quick", "time"]],
    ["spark", ["试", "冒险", "new", "try"]],
    ["heart", ["喜欢", "想要", "love", "want"]],
    ["music", ["音乐", "歌", "music", "song"]],
    ["pet", ["宠物", "猫", "狗", "pet", "cat", "dog"]],
    ["sun", ["早", "上午", "sun", "morning"]],
    ["moon", ["晚上", "夜", "moon", "night"]],
    ["check", ["决定", "确定", "pick"]],
    ["dice", ["随机", "抽", "random"]],
    ["wave", ["水", "冷静", "water", "calm"]],
    ["bowl", ["吃", "喝", "饭", "food", "eat"]]
  ]) {
    if (words.some((word) => text.includes(word))) return pattern;
  }
  return PATTERNS[stableHash(`${question}:${answer}:${choice}`) % PATTERNS.length];
}

function normalizeTone(value, question, answer, choice) {
  const key = String(value || "").toLowerCase().replace(/[^a-z]/g, "");
  if (TONES.includes(key)) return key;
  const text = `${question} ${answer}`.toLowerCase();
  if (hasAny(text, ["冰箱", "水", "雨", "晚上", "fridge", "water", "rain", "night"])) return "cyan";
  if (hasAny(text, ["清爽", "蔬", "健康", "运动", "fresh", "health", "exercise"])) return "green";
  if (hasAny(text, ["预算", "钱", "钥匙", "礼物", "budget", "money", "gift"])) return "gold";
  if (hasAny(text, ["店", "餐厅", "买", "辣", "restaurant", "shopping", "spicy"])) return "orange";
  if (hasAny(text, ["朋友", "电话", "音乐", "friend", "call", "music"])) return "violet";
  if (hasAny(text, ["快", "时间", "路", "工作", "quick", "time", "route", "work"])) return "blue";
  if (hasAny(text, ["试", "电影", "喜欢", "new", "movie", "love"])) return "rose";
  if (hasAny(text, ["家", "咖啡", "home", "coffee"])) return "coral";
  return TONES[stableHash(`${question}:${answer}:${choice}`) % TONES.length];
}

function hasAny(text, words) {
  return words.some((word) => text.includes(word));
}

function compactAnswer(answer, locale) {
  const normalized = String(answer || "").replace(/\s+/g, " ").trim();
  if (locale.toLowerCase().startsWith("zh")) return normalized.slice(0, 18);
  return normalized.split(" ").slice(0, 10).join(" ");
}

function firstUnusedFallback(fallback, usedAnswers, preferredIndex) {
  const ordered = [...fallback.slice(preferredIndex), ...fallback.slice(0, preferredIndex)];
  return ordered.find((card) => !usedAnswers.has(compactKey(card.answer)))?.answer || fallback[preferredIndex].answer;
}

function isLowUtilityAnswer(answer, question) {
  const text = String(answer || "").toLowerCase();
  const context = String(question || "").toLowerCase();
  const socialWords = ["朋友", "同事", "别人", "一起", "friend", "coworker", "someone else", "ask someone"];
  if (!hasAny(context, socialWords) && hasAny(text, socialWords)) return true;
  return hasAny(text, ["随便", "都行", "看心情", "random", "whatever", "up to you", "anything"]);
}

function compactKey(answer) {
  return String(answer || "").replace(/\s+/g, "").toLowerCase();
}

function serialFor(question, choice) {
  return String(stableHash(`${question}:${choice}`) % 100000).padStart(5, "0");
}

function stableHash(value) {
  return Number.parseInt(
    crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, 12),
    16
  );
}
