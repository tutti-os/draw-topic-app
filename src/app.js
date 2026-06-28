const defaultLocale = "zh-CN";
const supportedLocales = ["en", "zh-CN"];
const choices = ["A", "B", "C", "D", "E"];
const wheelStepDeg = 360 / choices.length;
const minDealMs = 3000;
const drawRequestTimeoutMs = 210000;
const dealingHintRotationMs = 5000;
const dealingLateHintDelayMs = 10000;
const dealStartSpeedDegPerMs = 0.08;
const dealMaxSpeedDegPerMs = 0.32;
const dealAccelerationMs = 1800;
const allowedTones = [
  "coral",
  "cyan",
  "green",
  "gold",
  "orange",
  "violet",
  "blue",
  "rose",
];
const allowedPatterns = [
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
  "plane",
];
const patternRows = {
  bowl: [
    "..........",
    "..........",
    "..#....#..",
    "..#....#..",
    "...####...",
    "..######..",
    "..######..",
    "...####...",
    "....##....",
    "..........",
  ],
  fridge: [
    "..........",
    "...####...",
    "...#..#...",
    "...#..#...",
    "...####...",
    "...#..#...",
    "...#..#...",
    "...####...",
    "..........",
    "..........",
  ],
  shop: [
    "..........",
    "..######..",
    ".########.",
    ".#.#.#.#..",
    "..######..",
    "..#....#..",
    "..#.##.#..",
    "..######..",
    "..........",
    "..........",
  ],
  friend: [
    "..........",
    "..##..##..",
    "..##..##..",
    "..........",
    ".########.",
    ".#......#.",
    ".#.####.#.",
    "..#....#..",
    "..........",
    "..........",
  ],
  spark: [
    "..........",
    "....##....",
    "....##....",
    "..######..",
    "..######..",
    "....##....",
    "...####...",
    "..##..##..",
    "..........",
    "..........",
  ],
  leaf: [
    "..........",
    ".....##...",
    "....####..",
    "...######.",
    "..######..",
    "...####...",
    "....##....",
    "...##.....",
    "..........",
    "..........",
  ],
  home: [
    "..........",
    "....##....",
    "...####...",
    "..######..",
    ".########.",
    "...#..#...",
    "...####...",
    "...#..#...",
    "..........",
    "..........",
  ],
  clock: [
    "..........",
    "...####...",
    "..#....#..",
    ".#..#...#.",
    ".#..#...#.",
    ".#..###.#.",
    "..#....#..",
    "...####...",
    "..........",
    "..........",
  ],
  heart: [
    "..........",
    "..##..##..",
    ".########.",
    ".########.",
    "..######..",
    "...####...",
    "....##....",
    "..........",
    "..........",
    "..........",
  ],
  dice: [
    "..........",
    "..######..",
    "..#....#..",
    "..#.##.#..",
    "..#....#..",
    "..#.##.#..",
    "..#....#..",
    "..######..",
    "..........",
    "..........",
  ],
  check: [
    "..........",
    "..........",
    ".......##.",
    "......##..",
    ".##..##...",
    "..####....",
    "...##.....",
    "..........",
    "..........",
    "..........",
  ],
  wave: [
    "..........",
    "..........",
    "..##...##.",
    ".####.####",
    "##..###..#",
    "#....#....",
    "..........",
    "..........",
    "..........",
    "..........",
  ],
  book: [
    "..........",
    "..###.###.",
    "..#.#.#.#.",
    "..#.#.#.#.",
    "..###.###.",
    "..#...#.#.",
    "..#...#.#.",
    "..###.###.",
    "..........",
    "..........",
  ],
  route: [
    "..........",
    "..##......",
    ".####.....",
    "..##......",
    "...##.....",
    "....##....",
    ".....##...",
    "......##..",
    ".....####.",
    "......##..",
  ],
  coin: [
    "..........",
    "...####...",
    "..######..",
    ".##.##.##.",
    ".##.##....",
    ".##.##.##.",
    "..######..",
    "...####...",
    "..........",
    "..........",
  ],
  bed: [
    "..........",
    "..........",
    "..##......",
    "..##......",
    "..########",
    "..#..#..#.",
    "..########",
    "..#....#..",
    "..........",
    "..........",
  ],
  laptop: [
    "..........",
    "..######..",
    "..#....#..",
    "..#....#..",
    "..#....#..",
    "..######..",
    ".########.",
    "..........",
    "..........",
    "..........",
  ],
  broom: [
    "..........",
    "......##..",
    ".....##...",
    "....##....",
    "...##.....",
    "..####....",
    ".######...",
    ".######...",
    "..........",
    "..........",
  ],
  phone: [
    "..........",
    "...####...",
    "..######..",
    "..#....#..",
    "..#....#..",
    "..#....#..",
    "..######..",
    "...####...",
    "....##....",
    "..........",
  ],
  cart: [
    "..........",
    "..#.......",
    "..######..",
    "...#..#...",
    "...####...",
    "..######..",
    "...#..#...",
    "...#..#...",
    "..........",
    "..........",
  ],
  key: [
    "..........",
    "..####....",
    ".##..##...",
    ".##..##...",
    "..####....",
    "....######",
    "......##..",
    "......####",
    "..........",
    "..........",
  ],
  gift: [
    "..........",
    "..##..##..",
    "...####...",
    ".########.",
    ".###..###.",
    ".########.",
    ".###..###.",
    ".########.",
    "..........",
    "..........",
  ],
  coffee: [
    "..........",
    "..######..",
    "..#....##.",
    "..#....##.",
    "..#....#..",
    "..######..",
    "...####...",
    ".########.",
    "..........",
    "..........",
  ],
  umbrella: [
    "..........",
    "...####...",
    "..######..",
    ".########.",
    "#..##..#..",
    "....##....",
    "....##....",
    "...###....",
    "..........",
    "..........",
  ],
  music: [
    "..........",
    ".....####.",
    ".....#..#.",
    ".....#..#.",
    ".....#....",
    "..####....",
    ".######...",
    "..####....",
    "..........",
    "..........",
  ],
  movie: [
    "..........",
    ".########.",
    ".#.#..#.#.",
    ".########.",
    ".#......#.",
    ".#......#.",
    ".########.",
    ".#.#..#.#.",
    ".########.",
    "..........",
  ],
  medkit: [
    "..........",
    "...####...",
    "...#..#...",
    ".########.",
    ".###..###.",
    ".##....##.",
    ".###..###.",
    ".########.",
    "..........",
    "..........",
  ],
  dumbbell: [
    "..........",
    "..........",
    ".##....##.",
    "####..####",
    "##########",
    "####..####",
    ".##....##.",
    "..........",
    "..........",
    "..........",
  ],
  sun: [
    "..........",
    ".##....##.",
    "...####...",
    "..######..",
    ".########.",
    ".########.",
    "..######..",
    "...####...",
    ".##....##.",
    "..........",
  ],
  moon: [
    "..........",
    "....####..",
    "...######.",
    "..####....",
    "..###.....",
    "..###.....",
    "..####....",
    "...######.",
    "....####..",
    "..........",
  ],
  map: [
    "..........",
    ".###..###.",
    ".#.#..#.#.",
    ".#.#..#.#.",
    ".###..###.",
    ".#..##..#.",
    ".#..##..#.",
    ".###..###.",
    "..........",
    "..........",
  ],
  tool: [
    "..........",
    ".##...##..",
    "..##.##...",
    "...###....",
    "....#.....",
    "...###....",
    "..##.##...",
    ".##...##..",
    "..........",
    "..........",
  ],
  pet: [
    "..........",
    "..##..##..",
    ".####.####",
    "..........",
    "...####...",
    "..######..",
    "..######..",
    "...####...",
    "..........",
    "..........",
  ],
  shirt: [
    "..........",
    "..##..##..",
    ".########.",
    "###.##.###",
    "##..##..##",
    "...####...",
    "...####...",
    "...####...",
    "..........",
    "..........",
  ],
  car: [
    "..........",
    "..........",
    "...####...",
    "..######..",
    ".########.",
    "##.####.##",
    ".########.",
    "..##..##..",
    "..........",
    "..........",
  ],
  plane: [
    "..........",
    "....##....",
    "...####...",
    "..######..",
    "##########",
    "...####...",
    "..##..##..",
    ".##....##.",
    "..........",
    "..........",
  ],
};
const idleToneByChoice = {
  A: "cyan",
  B: "coral",
  C: "green",
  D: "rose",
  E: "violet",
};

let messages = {};
let locale = defaultLocale;
let stage = "idle";
let currentQuestion = "";
let currentAnswers = [];
let revealedChoices = new Set();
let activeChoice = "C";
let statusMessageKey = "";
let dealFrameId = 0;
let dealTick = 0;
let dealMotion = "idle";
let dealWheelAngle = 0;
let lastDealFrameAt = 0;
let dealMotionStartedAt = 0;
let pinnedChoice = "";
let selectedDealingHint = "";
let dealingHintRotationId = 0;
let dealingHintStartedAt = 0;
let providerOptions = [];
let selectedProviderId = "";
let providerMenuOpen = false;

const elements = {
  table: document.querySelector("#card-table"),
  title: document.querySelector("title"),
  form: document.querySelector("#prompt-form"),
  actions: document.querySelector(".prompt-actions"),
  input: document.querySelector("#question-input"),
  button: document.querySelector("#draw-button"),
  quickRedrawButton: document.querySelector("#quick-redraw-button"),
  status: document.querySelector("#draw-status"),
  statusText: document.querySelector("#draw-status-text"),
  providerPicker: document.querySelector("#provider-picker"),
  providerTrigger: document.querySelector("#provider-trigger"),
  providerMenu: document.querySelector("#provider-menu"),
  cards: Object.fromEntries(
    choices.map((choice) => [choice, document.querySelector(`[data-choice="${choice}"]`)]),
  ),
};

await loadMessages();
locale = normalizeLocale(await detectLocale());
document.documentElement.lang = locale;
await loadProviders();
currentAnswers = buildFallbackAnswers("");
bindEvents();
render();
subscribeHostLocale();
writeHostLog("draw-topic-app.loaded", { locale });

async function loadMessages() {
  const entries = await Promise.all(
    supportedLocales.map(async (candidate) => {
      const response = await fetch(`/locales/${candidate}/app.json`);
      return [candidate, await response.json()];
    }),
  );
  messages = Object.fromEntries(entries);
  assertI18nParity();
}

function bindEvents() {
  elements.input.addEventListener("input", () => {
    if (stage === "dealing") return;
    if (stage === "idle") {
      currentQuestion = elements.input.value.trim();
      statusMessageKey = "";
    } else if (stage === "ready") {
      statusMessageKey = "";
    }
    renderStatus();
    renderActions();
  });

  elements.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (stage === "dealing") return;
    await deal(drawQuestionFromInput());
  });

  elements.quickRedrawButton.addEventListener("click", async () => {
    if (stage !== "ready") return;
    await deal(currentQuestion);
  });

  elements.providerTrigger.addEventListener("click", (event) => {
    event.stopPropagation();
    if (stage === "dealing" || providerOptions.length === 0) return;
    providerMenuOpen = !providerMenuOpen;
    renderProviders();
  });

  elements.providerTrigger.addEventListener("keydown", (event) => {
    if (!["Enter", " ", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    if (stage === "dealing" || providerOptions.length === 0) return;
    providerMenuOpen = true;
    renderProviders();
    elements.providerMenu.querySelector('[role="option"]')?.focus();
  });

  elements.providerMenu.addEventListener("click", (event) => {
    event.stopPropagation();
    const option =
      event.target instanceof Element ? event.target.closest("[data-provider-id]") : null;
    if (!option) return;
    selectedProviderId = option.dataset.providerId || "";
    providerMenuOpen = false;
    renderProviders();
  });

  elements.providerMenu.addEventListener("keydown", (event) => {
    const options = Array.from(elements.providerMenu.querySelectorAll('[role="option"]'));
    const currentIndex = options.indexOf(document.activeElement);
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeProviderMenu();
      elements.providerTrigger.focus();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      event.stopPropagation();
      options[(currentIndex + 1) % options.length]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();
      options[(currentIndex - 1 + options.length) % options.length]?.focus();
    }
  });

  document.addEventListener("click", () => {
    closeProviderMenu();
  });

  for (const choice of choices) {
    elements.cards[choice].addEventListener("click", () => {
      if (!["idle", "ready"].includes(stage)) return;
      const isCurrentChoice = choice === activeChoice;
      activeChoice = choice;
      if (stage === "ready") {
        revealedChoices.add(choice);
        pinnedChoice = isCurrentChoice ? choice : "";
      } else {
        pinnedChoice = "";
      }
      render();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && providerMenuOpen) {
      event.preventDefault();
      closeProviderMenu();
      return;
    }
    if (event.key === "Escape") reset();
    if (stage === "ready" && ["ArrowLeft", "ArrowRight"].includes(event.key)) {
      const currentIndex = choices.indexOf(activeChoice);
      const delta = event.key === "ArrowRight" ? 1 : -1;
      activeChoice = choices[(currentIndex + delta + choices.length) % choices.length];
      pinnedChoice = "";
      revealedChoices.add(activeChoice);
      render();
    }
  });
}

async function deal(requestedQuestion = elements.input.value.trim()) {
  const question = questionForDraw(requestedQuestion);
  if (!question) {
    shakePrompt();
    return;
  }

  currentQuestion = question;
  elements.input.value = question;
  currentAnswers = buildFallbackAnswers(question);
  revealedChoices = new Set();
  activeChoice = "C";
  pinnedChoice = "";
  statusMessageKey = "";
  dealingHintStartedAt = Date.now();
  selectedDealingHint = randomDealingHint();
  stage = "dealing";
  startDealMotion();
  startDealingHintRotation();
  render();

  let nextStage = "ready";
  let winningChoice = pickWinningChoice(question);
  const startedAt = Date.now();
  try {
    const payload = await fetchCards(question);
    if (payload?.cards?.length === choices.length) {
      currentAnswers = normalizeServerCards(payload.cards, question);
      winningChoice = pickWinningChoice(`${question}:${JSON.stringify(payload.cards)}`);
      writeHostLog("draw-topic-app.agent_cards", {
        source: payload.source || "unknown",
        provider: payload.provider || "",
        fallback: payload.source === "local-fallback",
        fallbackReason: payload.fallbackReason || "",
        count: payload.cards.length,
      });
    } else {
      throw new Error("Invalid card response");
    }
  } catch (error) {
    nextStage = "idle";
    statusMessageKey = "app.drawFailed";
    writeHostLog("draw-topic-app.agent_failed", { message: String(error) });
  }

  await waitForMinimumDealTime(startedAt);
  if (nextStage === "ready") {
    pinnedChoice = winningChoice;
    await finishDealMotion(winningChoice);
  } else {
    stopDealMotion();
  }
  stopDealingHintRotation();
  stage = nextStage;
  if (nextStage === "ready") {
    statusMessageKey = "app.readyHint";
    activeChoice = winningChoice;
  }
  render();
}

function reset() {
  stopDealMotion();
  stopDealingHintRotation();
  stage = "idle";
  currentQuestion = "";
  elements.input.value = "";
  statusMessageKey = "";
  selectedDealingHint = "";
  revealedChoices = new Set();
  activeChoice = "C";
  pinnedChoice = "";
  currentAnswers = buildFallbackAnswers("");
  render();
}

function drawQuestionFromInput() {
  return questionForDraw(elements.input.value);
}

function questionForDraw(value) {
  return (
    String(value || "").trim() ||
    currentQuestion ||
    elements.input.placeholder.trim() ||
    t("app.defaultQuestion")
  );
}

function startDealMotion() {
  stopDealMotion();
  dealTick = 0;
  dealMotion = "fast";
  dealWheelAngle = centeredWheelAngleFor(activeChoice);
  dealMotionStartedAt = performance.now();
  lastDealFrameAt = dealMotionStartedAt;
  renderCylinderPositions();

  const spin = (timestamp) => {
    const elapsed = Math.min(48, timestamp - lastDealFrameAt);
    lastDealFrameAt = timestamp;
    dealWheelAngle += elapsed * currentDealSpeedDegPerMs(timestamp);
    dealTick = Math.floor(dealWheelAngle / 12);
    activeChoice = frontChoiceForAngle(dealWheelAngle);
    renderCylinderPositions();
    dealFrameId = window.requestAnimationFrame(spin);
  };
  dealFrameId = window.requestAnimationFrame(spin);
}

function finishDealMotion(targetChoice) {
  stopDealMotion();
  dealMotion = "slow";
  const startedAt = performance.now();
  const startAngle = dealWheelAngle;
  const endAngle = finalWheelAngleFor(targetChoice, startAngle);
  const distance = endAngle - startAngle;
  const durationMs = Math.min(4600, Math.max(2800, (distance * 2.2) / dealMaxSpeedDegPerMs));
  renderCylinderPositions();

  return new Promise((resolve) => {
    const coast = (timestamp) => {
      const progress = Math.min(1, (timestamp - startedAt) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 2);
      dealWheelAngle = startAngle + (endAngle - startAngle) * eased;
      dealTick = Math.floor(dealWheelAngle / 12);
      activeChoice = progress === 1 ? targetChoice : frontChoiceForAngle(dealWheelAngle);
      renderCylinderPositions();
      if (progress === 1) {
        dealMotion = "idle";
        dealFrameId = 0;
        resolve();
        return;
      }
      dealFrameId = window.requestAnimationFrame(coast);
    };

    dealFrameId = window.requestAnimationFrame(coast);
  });
}

function currentDealSpeedDegPerMs(timestamp) {
  const accelerationProgress = Math.min(
    1,
    (timestamp - dealMotionStartedAt) / dealAccelerationMs,
  );
  const easedProgress = accelerationProgress * accelerationProgress;
  return (
    dealStartSpeedDegPerMs +
    (dealMaxSpeedDegPerMs - dealStartSpeedDegPerMs) * easedProgress
  );
}

function centeredWheelAngleFor(choice) {
  return -choices.indexOf(choice) * wheelStepDeg;
}

function finalWheelAngleFor(choice, currentAngle) {
  const centeredAngle = centeredWheelAngleFor(choice);
  const loops = Math.ceil((currentAngle - centeredAngle) / 360) + 1;
  return centeredAngle + loops * 360;
}

function frontChoiceForAngle(wheelAngle) {
  return choices.reduce((frontChoice, choice) => {
    const currentAngle = Math.abs(normalizeAngle(cardCylinderAngle(choice, wheelAngle)));
    const bestAngle = Math.abs(normalizeAngle(cardCylinderAngle(frontChoice, wheelAngle)));
    return currentAngle < bestAngle ? choice : frontChoice;
  }, choices[0]);
}

function cardCylinderAngle(choice, wheelAngle) {
  return choices.indexOf(choice) * wheelStepDeg + wheelAngle;
}

function normalizeAngle(angle) {
  return ((((angle + 180) % 360) + 360) % 360) - 180;
}

function stopDealMotion() {
  if (dealFrameId) window.cancelAnimationFrame(dealFrameId);
  dealFrameId = 0;
  dealMotion = "idle";
}

async function fetchCards(question) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), drawRequestTimeoutMs);
  try {
    const response = await fetch("/api/draw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, locale, provider: selectedProviderId }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Draw request failed with ${response.status}`);
    const payload = await response.json();
    if (payload?.ok === false) throw new Error(payload.error || "Draw request failed");
    return payload;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function loadProviders() {
  try {
    const response = await fetch("/api/providers");
    if (!response.ok) throw new Error(`Provider request failed with ${response.status}`);
    const payload = await response.json();
    providerOptions = Array.isArray(payload.providers)
      ? payload.providers.filter((provider) => provider.available)
      : [];
    selectedProviderId =
      providerOptions.find((provider) => provider.id === payload.defaultProvider)?.id ||
      providerOptions[0]?.id ||
      "";
  } catch (error) {
    providerOptions = [];
    selectedProviderId = "";
    writeHostLog("draw-topic-app.providers_failed", { message: String(error) });
  }
  renderProviders();
}

function renderProviders() {
  if (stage === "dealing") providerMenuOpen = false;
  const selectedProvider = currentProvider();
  const hasProviders = providerOptions.length > 0;
  elements.actions.classList.toggle("has-provider-picker", hasProviders);
  elements.providerPicker.hidden = !hasProviders;
  elements.providerTrigger.disabled = stage === "dealing";
  elements.providerTrigger.setAttribute(
    "aria-label",
    `${t("app.provider")}: ${selectedProvider?.label || t("app.provider")}`,
  );
  elements.providerTrigger.setAttribute("aria-expanded", String(providerMenuOpen));
  elements.providerTrigger.innerHTML = `
    <span class="provider-trigger-label">${escapeHtml(selectedProvider?.label || t("app.provider"))}</span>
    <span class="provider-chevron" aria-hidden="true"></span>
  `;
  elements.providerMenu.hidden = !providerMenuOpen || !hasProviders;
  elements.providerMenu.innerHTML = providerOptions
    .map(
      (provider) => `
        <button
          class="provider-option"
          type="button"
          role="option"
          data-provider-id="${escapeAttribute(provider.id)}"
          aria-selected="${provider.id === selectedProviderId}"
        >
          <span class="provider-check" aria-hidden="true">✓</span>
          <span>${escapeHtml(provider.label)}</span>
        </button>
      `,
    )
    .join("");
}

function currentProvider() {
  return providerOptions.find((provider) => provider.id === selectedProviderId) || providerOptions[0];
}

function closeProviderMenu() {
  if (!providerMenuOpen) return;
  providerMenuOpen = false;
  renderProviders();
}

function waitForMinimumDealTime(startedAt) {
  return sleep(Math.max(0, minDealMs - (Date.now() - startedAt)));
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function shakePrompt() {
  elements.form.classList.remove("is-shaking");
  requestAnimationFrame(() => elements.form.classList.add("is-shaking"));
  window.setTimeout(() => elements.form.classList.remove("is-shaking"), 360);
}

function normalizeServerCards(cards, question) {
  const fallback = buildFallbackAnswers(question);
  const usedAnswers = new Set();
  return choices.map((choice, index) => {
    const source = cards.find((card) => card.choice === choice) || cards[index] || {};
    const rawAnswer = String(source.answer || "").trim();
    const answer =
      rawAnswer && !isLowUtilityAnswer(rawAnswer, question) && !usedAnswers.has(compactAnswerKey(rawAnswer))
        ? rawAnswer
        : firstUnusedFallbackAnswer(fallback, usedAnswers, index);
    usedAnswers.add(compactAnswerKey(answer));
    return {
      choice,
      serial: source.serial || serialFor(question, choice),
      answer,
      pattern: patternFromServer(source, question, answer, choice),
      tone: toneFromServer(source, question, answer, choice),
    };
  });
}

function buildFallbackAnswers(question) {
  const pool = answerPool();
  const normalized = question || t("app.defaultQuestion");
  const offset = hashString(normalized) % pool.length;
  return choices.map((choice, index) => {
    const answer = pool[(offset + index * 3) % pool.length];
    return {
      choice,
      serial: serialFor(normalized, choice),
      answer,
      pattern: semanticPatternFor(normalized, answer, choice),
      tone: semanticToneFor(normalized, answer, choice),
    };
  });
}

function answerPool() {
  return [
    t("answer.1"),
    t("answer.2"),
    t("answer.3"),
    t("answer.4"),
    t("answer.5"),
    t("answer.6"),
    t("answer.7"),
    t("answer.8"),
    t("answer.9"),
    t("answer.10"),
    t("answer.11"),
    t("answer.12"),
  ];
}

function render() {
  const appName = t("app.name");
  elements.title.textContent = appName;
  elements.table.setAttribute("aria-label", `${appName}${t("app.choice")}`);
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  });

  elements.button.textContent = buttonLabel();
  elements.input.disabled = stage === "dealing";
  elements.table.dataset.stage = stage;
  elements.table.dataset.active = activeChoice;
  elements.table.dataset.motion = dealMotion;
  renderActions();
  renderStatus();
  renderCards();
}

function renderStatus() {
  const message = statusText();
  elements.statusText.textContent = message;
  elements.status.hidden = !message && elements.quickRedrawButton.hidden;
  elements.status.dataset.tone = statusMessageKey === "app.drawFailed" ? "error" : stage;
}

function renderActions() {
  elements.button.disabled = stage === "dealing";
  elements.quickRedrawButton.hidden = stage !== "ready";
  elements.quickRedrawButton.disabled = stage !== "ready";
  elements.quickRedrawButton.textContent = t("app.quickRedraw");
  renderProviders();
}

function renderCards() {
  currentAnswers.forEach((card) => {
    const node = elements.cards[card.choice];
    const isRevealed = revealedChoices.has(card.choice);
    const isActive = activeChoice === card.choice;
    const pattern = stage === "dealing" ? loadingPatternFor(card.choice) : card.pattern;
    const tone = stage === "idle" ? idleToneByChoice[card.choice] : card.tone;
    node.className = cardClassName(card, tone, isRevealed, isActive);
    node.setAttribute("aria-label", `${t("app.choice")} ${card.choice}`);
    syncCardMotionStyle(node, card.choice);

    node.innerHTML = `
      <div class="card-face">
        <header>
          <span>${t("app.name")}</span>
        </header>
        <div class="dot-board" aria-hidden="true">
          ${pattern
            .map(
              (active, index) =>
                `<span class="${active ? "active" : ""}" style="--dot-index:${index}"></span>`,
            )
            .join("")}
        </div>
        <div class="answer ${answerLengthClass(card.answer)} ${isRevealed ? "" : "is-hidden"}">
          <strong>${escapeHtml(card.answer)}</strong>
        </div>
      </div>
    `;
  });
}

function renderCylinderPositions() {
  elements.table.dataset.active = activeChoice;
  elements.table.dataset.motion = dealMotion;
  currentAnswers.forEach((card) => {
    const node = elements.cards[card.choice];
    const isRevealed = revealedChoices.has(card.choice);
    const isActive = activeChoice === card.choice;
    const tone = stage === "idle" ? idleToneByChoice[card.choice] : card.tone;
    node.className = cardClassName(card, tone, isRevealed, isActive);
    syncCardMotionStyle(node, card.choice);
  });
}

function cardClassName(card, tone, isRevealed, isActive) {
  const classes = [
    "choice-card",
    `card-${card.choice.toLowerCase()}`,
    positionClassFor(card.choice),
    `theme-${tone}`,
  ];
  if (isRevealed) classes.push("is-revealed");
  if (isActive) classes.push("is-featured");
  if (pinnedChoice === card.choice) classes.push("is-pinned");
  if (stage === "dealing") classes.push("is-dealing");
  if (["idle", "ready"].includes(stage)) classes.push("is-clickable");
  return classes.join(" ");
}

function syncCardMotionStyle(node, choice) {
  if (stage !== "dealing") {
    node.style.removeProperty("--cylinder-angle");
    node.style.removeProperty("--cylinder-opacity");
    node.style.removeProperty("--cylinder-scale");
    node.style.removeProperty("--cylinder-blur");
    node.style.removeProperty("z-index");
    node.style.removeProperty("opacity");
    return;
  }

  const angle = normalizeAngle(cardCylinderAngle(choice, dealWheelAngle));
  const depth = Math.cos((angle * Math.PI) / 180);
  const frontness = Math.max(0, depth);
  const opacity = 0.68 + frontness * 0.32;
  node.style.setProperty("--cylinder-angle", `${angle}deg`);
  node.style.setProperty("--cylinder-opacity", String(opacity));
  node.style.setProperty("--cylinder-scale", String(0.78 + frontness * 0.2));
  node.style.setProperty("--cylinder-blur", `${Math.max(0, 1 - frontness) * 1.2}px`);
  const zIndex = Math.round((depth + 1) * 100) + (pinnedChoice === choice ? 300 : 0);
  node.style.zIndex = String(zIndex);
  node.style.opacity = String(opacity);
}

function positionClassFor(choice) {
  const activeIndex = choices.indexOf(activeChoice);
  const index = choices.indexOf(choice);
  const half = Math.floor(choices.length / 2);
  let delta = index - activeIndex;
  if (delta > half) delta -= choices.length;
  if (delta < -half) delta += choices.length;
  return {
    "-2": "card-pos-left-2",
    "-1": "card-pos-left-1",
    0: "card-pos-center",
    1: "card-pos-right-1",
    2: "card-pos-right-2",
  }[delta];
}

function patternFromServer(source, question, answer, choice) {
  if (Array.isArray(source.pattern) && source.pattern.length === 100) {
    return source.pattern.map(Boolean);
  }
  const key = normalizePatternKey(source.pattern || source.patternKey || source.glyph || source.icon);
  if (key) return patternByKey(key);
  return semanticPatternFor(question, answer, choice);
}

function toneFromServer(source, question, answer, choice) {
  const tone = normalizeToneKey(source.tone || source.color || source.palette);
  if (tone) return tone;
  const patternKey = normalizePatternKey(source.pattern || source.patternKey || source.glyph || source.icon);
  if (patternKey) return toneForPattern(patternKey, question, answer, choice);
  return semanticToneFor(question, answer, choice);
}

function semanticPatternFor(question, answer, choice) {
  const text = `${question} ${answer}`.toLowerCase();
  if (matchesAny(text, ["冰箱", "fridge", "冷藏", "剩菜"])) return patternByKey("fridge");
  if (matchesAny(text, ["伞", "雨", "天气", "umbrella", "rain", "weather"])) return patternByKey("umbrella");
  if (matchesAny(text, ["咖啡", "茶", "奶茶", "提神", "coffee", "tea", "caffeine"])) return patternByKey("coffee");
  if (matchesAny(text, ["运动", "健身", "跑步", "训练", "exercise", "workout", "run", "gym"])) {
    return patternByKey("dumbbell");
  }
  if (matchesAny(text, ["飞机", "航班", "机场", "远行", "plane", "flight", "airport"])) return patternByKey("plane");
  if (matchesAny(text, ["电影", "剧", "视频", "movie", "show", "video", "watch"])) return patternByKey("movie");
  if (matchesAny(text, ["衣服", "穿", "外套", "搭配", "clothes", "shirt", "wear", "outfit"])) {
    return patternByKey("shirt");
  }
  if (matchesAny(text, ["预算", "钱", "便宜", "贵", "省", "budget", "money", "cheap", "cost", "save"])) {
    return patternByKey("coin");
  }
  if (matchesAny(text, ["钥匙", "门", "锁", "入口", "key", "lock", "door", "access"])) return patternByKey("key");
  if (matchesAny(text, ["礼物", "送", "惊喜", "gift", "present", "surprise"])) return patternByKey("gift");
  if (matchesAny(text, ["咖啡", "茶", "奶茶", "提神", "coffee", "tea", "caffeine"])) return patternByKey("coffee");
  if (matchesAny(text, ["买", "购物", "下单", "逛", "purchase", "buy", "shopping", "order"])) {
    return patternByKey("cart");
  }
  if (matchesAny(text, ["店", "餐厅", "外卖", "新店", "shop", "restaurant", "takeout"])) {
    return patternByKey("shop");
  }
  if (matchesAny(text, ["电话", "联系", "消息", "回复", "call", "text", "message", "reply"])) {
    return patternByKey("phone");
  }
  if (matchesAny(text, ["朋友", "同事", "问", "一起", "friend", "ask", "team", "together"])) return patternByKey("friend");
  if (matchesAny(text, ["伞", "雨", "天气", "umbrella", "rain", "weather"])) return patternByKey("umbrella");
  if (matchesAny(text, ["清爽", "轻", "沙拉", "蔬", "light", "salad", "fresh"])) {
    return patternByKey("leaf");
  }
  if (matchesAny(text, ["家", "上次", "常去", "home", "usual", "again"])) return patternByKey("home");
  if (matchesAny(text, ["走", "路", "通勤", "出门", "去", "旅行", "walk", "route", "commute", "go", "travel"])) {
    return patternByKey("route");
  }
  if (matchesAny(text, ["地图", "方向", "附近", "导航", "map", "direction", "nearby", "navigate"])) {
    return patternByKey("map");
  }
  if (matchesAny(text, ["开车", "打车", "车", "car", "drive", "taxi", "rideshare"])) return patternByKey("car");
  if (matchesAny(text, ["飞机", "航班", "机场", "远行", "plane", "flight", "airport"])) return patternByKey("plane");
  if (matchesAny(text, ["学习", "读", "书", "课程", "笔记", "study", "read", "book", "course", "notes"])) {
    return patternByKey("book");
  }
  if (matchesAny(text, ["工作", "电脑", "邮件", "写", "项目", "work", "laptop", "email", "write", "project"])) {
    return patternByKey("laptop");
  }
  if (matchesAny(text, ["睡", "休息", "躺", "暂停", "sleep", "rest", "nap", "pause"])) return patternByKey("bed");
  if (matchesAny(text, ["收拾", "整理", "打扫", "清理", "clean", "tidy", "organize"])) return patternByKey("broom");
  if (matchesAny(text, ["修", "工具", "组装", "维修", "fix", "repair", "tool", "build"])) return patternByKey("tool");
  if (matchesAny(text, ["运动", "健身", "跑步", "训练", "exercise", "workout", "run", "gym"])) {
    return patternByKey("dumbbell");
  }
  if (matchesAny(text, ["医生", "药", "健康", "不舒服", "medical", "medicine", "health", "sick"])) {
    return patternByKey("medkit");
  }
  if (matchesAny(text, ["快", "马上", "时间", "十分钟", "倒计时", "quick", "now", "time", "minutes", "timer"])) {
    return patternByKey("clock");
  }
  if (matchesAny(text, ["试", "踩雷", "冒险", "new", "risk", "try"])) return patternByKey("spark");
  if (matchesAny(text, ["喜欢", "爱", "想要", "奖励", "love", "like", "want", "treat"])) return patternByKey("heart");
  if (matchesAny(text, ["音乐", "歌", "听", "music", "song", "playlist", "listen"])) return patternByKey("music");
  if (matchesAny(text, ["电影", "剧", "视频", "movie", "show", "video", "watch"])) return patternByKey("movie");
  if (matchesAny(text, ["宠物", "猫", "狗", "pet", "cat", "dog"])) return patternByKey("pet");
  if (matchesAny(text, ["衣服", "穿", "外套", "搭配", "clothes", "shirt", "wear", "outfit"])) {
    return patternByKey("shirt");
  }
  if (matchesAny(text, ["早", "上午", "阳光", "太阳", "morning", "sun", "daylight"])) return patternByKey("sun");
  if (matchesAny(text, ["晚上", "夜", "月", "睡前", "night", "moon", "evening", "bedtime"])) {
    return patternByKey("moon");
  }
  if (matchesAny(text, ["决定", "确定", "yes", "ok", "pick"])) return patternByKey("check");
  if (matchesAny(text, ["随机", "抽", "随缘", "random", "chance", "roll"])) return patternByKey("dice");
  if (matchesAny(text, ["水", "游泳", "洗", "冷静", "water", "swim", "wash", "calm"])) return patternByKey("wave");
  if (matchesAny(text, ["吃", "喝", "饭", "餐", "food", "eat", "lunch", "dinner"])) {
    return patternByKey("bowl");
  }
  const fallbackKey = allowedPatterns[hashString(`${question}:${answer}:${choice}`) % allowedPatterns.length];
  return patternByKey(fallbackKey);
}

function semanticToneFor(question, answer, choice) {
  const text = `${question} ${answer}`.toLowerCase();
  if (matchesAny(text, ["冰箱", "fridge", "冷藏", "剩菜", "水", "water"])) return "cyan";
  if (matchesAny(text, ["清爽", "轻", "沙拉", "蔬", "light", "salad", "fresh"])) return "green";
  if (matchesAny(text, ["预算", "钱", "便宜", "贵", "省", "budget", "money", "cheap", "cost", "save"])) {
    return "gold";
  }
  if (matchesAny(text, ["钥匙", "门", "锁", "入口", "礼物", "送", "惊喜", "key", "lock", "door", "gift", "present"])) {
    return "gold";
  }
  if (matchesAny(text, ["咖啡", "茶", "奶茶", "提神", "coffee", "tea", "caffeine"])) return "coral";
  if (matchesAny(text, ["买", "购物", "下单", "逛", "purchase", "buy", "shopping", "order"])) return "orange";
  if (matchesAny(text, ["店", "餐厅", "外卖", "新店", "辣", "shop", "restaurant", "takeout", "spicy"])) {
    return "orange";
  }
  if (matchesAny(text, ["朋友", "同事", "问", "交给别人", "friend", "ask", "team", "someone else"])) {
    return "violet";
  }
  if (matchesAny(text, ["电话", "联系", "消息", "回复", "音乐", "歌", "call", "text", "message", "music", "song"])) {
    return "violet";
  }
  if (matchesAny(text, ["家", "上次", "常去", "home", "usual", "again"])) return "coral";
  if (matchesAny(text, ["快", "马上", "时间", "十分钟", "quick", "now", "time", "minutes"])) return "blue";
  if (matchesAny(text, ["走", "路", "通勤", "出门", "去", "旅行", "walk", "route", "commute", "go", "travel"])) {
    return "blue";
  }
  if (matchesAny(text, ["睡", "休息", "躺", "暂停", "sleep", "rest", "nap", "pause"])) return "cyan";
  if (matchesAny(text, ["伞", "雨", "天气", "晚上", "夜", "月", "umbrella", "rain", "weather", "night", "moon"])) {
    return "cyan";
  }
  if (matchesAny(text, ["工作", "电脑", "邮件", "写", "项目", "work", "laptop", "email", "write", "project"])) {
    return "blue";
  }
  if (matchesAny(text, ["开车", "打车", "飞机", "航班", "地图", "导航", "car", "drive", "plane", "flight", "map"])) {
    return "blue";
  }
  if (matchesAny(text, ["医生", "药", "健康", "运动", "健身", "medical", "medicine", "health", "exercise", "gym"])) {
    return "green";
  }
  if (matchesAny(text, ["试", "踩雷", "冒险", "new", "risk", "try"])) return "rose";
  if (matchesAny(text, ["电影", "剧", "视频", "movie", "show", "video"])) return "rose";
  if (matchesAny(text, ["喜欢", "爱", "想要", "奖励", "love", "like", "want", "treat"])) return "rose";
  if (matchesAny(text, ["决定", "确定", "预算", "yes", "ok", "pick", "budget"])) return "gold";
  return toneForPattern(
    allowedPatterns[hashString(`${question}:${answer}:${choice}`) % allowedPatterns.length],
    question,
    answer,
    choice,
  );
}

function toneForPattern(patternKey, question, answer, choice) {
  const mappedTone = {
    bowl: "gold",
    fridge: "cyan",
    shop: "orange",
    friend: "violet",
    spark: "rose",
    leaf: "green",
    home: "coral",
    clock: "blue",
    heart: "rose",
    dice: "gold",
    check: "green",
    wave: "blue",
    book: "green",
    route: "blue",
    coin: "gold",
    bed: "cyan",
    laptop: "blue",
    broom: "green",
    phone: "violet",
    cart: "orange",
    key: "gold",
    gift: "rose",
    coffee: "coral",
    umbrella: "cyan",
    music: "violet",
    movie: "rose",
    medkit: "green",
    dumbbell: "green",
    sun: "gold",
    moon: "blue",
    map: "blue",
    tool: "gold",
    pet: "coral",
    shirt: "violet",
    car: "blue",
    plane: "blue",
  }[patternKey];
  if (mappedTone) return mappedTone;
  return allowedTones[hashString(`${question}:${answer}:${choice}`) % allowedTones.length];
}

function matchesAny(text, needles) {
  return needles.some((needle) => text.includes(needle));
}

function firstUnusedFallbackAnswer(fallback, usedAnswers, preferredIndex) {
  const ordered = [...fallback.slice(preferredIndex), ...fallback.slice(0, preferredIndex)];
  const card = ordered.find((item) => !usedAnswers.has(compactAnswerKey(item.answer)));
  return card?.answer || fallback[preferredIndex].answer;
}

function isLowUtilityAnswer(answer, question) {
  const text = String(answer).toLowerCase();
  const context = String(question).toLowerCase();
  const socialWords = ["朋友", "同事", "别人", "一起", "friend", "coworker", "someone else", "ask someone"];
  const hasSocialContext = socialWords.some((word) => context.includes(word));
  if (!hasSocialContext && socialWords.some((word) => text.includes(word))) return true;
  return ["随便", "都行", "看心情", "random", "whatever", "up to you", "anything"].some((word) =>
    text.includes(word),
  );
}

function compactAnswerKey(answer) {
  return String(answer).replace(/\s+/g, "").toLowerCase();
}

function answerLengthClass(answer) {
  const length = Array.from(String(answer).replace(/\s+/g, "")).length;
  if (length <= 8) return "answer-short";
  if (length <= 10) return "answer-medium";
  return "answer-long";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[character];
  });
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function normalizePatternKey(value) {
  const key = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  return allowedPatterns.includes(key) ? key : "";
}

function normalizeToneKey(value) {
  const key = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  return allowedTones.includes(key) ? key : "";
}

function patternByKey(key) {
  const rows = patternRows[key] || patternRows.dice;
  return rows.join("").split("").map((cell) => cell === "#");
}

function loadingPatternFor(choice) {
  const offset = choices.indexOf(choice) * 2 + dealTick;
  return Array.from({ length: 100 }, (_, index) => {
    const x = index % 10;
    const y = Math.floor(index / 10);
    return (x + y + offset) % 4 === 0 || (x - y + offset + 12) % 7 === 0;
  });
}

function pickWinningChoice(seed) {
  const randomBytes = new Uint32Array(1);
  if (window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(randomBytes);
  } else {
    randomBytes[0] = Math.floor(Math.random() * 2 ** 32);
  }
  return choices[(hashString(`${seed}:${randomBytes[0]}`) % choices.length)];
}

function buttonLabel() {
  if (stage === "dealing") return t("app.dealing");
  return t("app.draw");
}

function statusText() {
  if (statusMessageKey) return t(statusMessageKey);
  if (stage === "dealing") return selectedDealingHint || t("app.dealingHint");
  if (stage === "ready") return t("app.readyHint");
  return "";
}

function startDealingHintRotation() {
  stopDealingHintRotation();
  dealingHintRotationId = window.setInterval(() => {
    if (stage !== "dealing") return;
    selectedDealingHint = randomDealingHint(selectedDealingHint);
    renderStatus();
  }, dealingHintRotationMs);
}

function stopDealingHintRotation() {
  window.clearInterval(dealingHintRotationId);
  dealingHintRotationId = 0;
  dealingHintStartedAt = 0;
}

function randomDealingHint(previousHint = "") {
  const hints = dealingHintPool();
  if (!Array.isArray(hints) || !hints.length) return t("app.dealingHint");
  if (hints.length === 1) return hints[0];
  let nextHint = hints[Math.floor(Math.random() * hints.length)];
  if (nextHint === previousHint) {
    nextHint = hints[(hints.indexOf(nextHint) + 1) % hints.length];
  }
  return nextHint;
}

function dealingHintPool() {
  const hasWaitedLong =
    dealingHintStartedAt > 0 && Date.now() - dealingHintStartedAt >= dealingLateHintDelayMs;
  const key = hasWaitedLong ? "app.dealingLateHints" : "app.dealingHints";
  return messages[locale]?.[key] || messages[defaultLocale]?.[key] || [];
}

function t(key) {
  return messages[locale]?.[key] || messages[defaultLocale]?.[key] || key;
}

function normalizeLocale(value) {
  const tag = String(value || "")
    .trim()
    .replace(/_/g, "-");
  if (!tag) return defaultLocale;
  const exact = supportedLocales.find(
    (candidate) => candidate.toLowerCase() === tag.toLowerCase(),
  );
  if (exact) return exact;
  const language = tag.split("-")[0].toLowerCase();
  return (
    supportedLocales.find(
      (candidate) => candidate.split("-")[0].toLowerCase() === language,
    ) || defaultLocale
  );
}

async function detectLocale() {
  try {
    const context = await window.tuttiExternal?.app?.getContext?.();
    if (context?.locale || context?.language) return context.locale || context.language;
  } catch {
    // Browser fallback below keeps the app usable outside Tutti Desktop.
  }
  return navigator.languages?.[0] || navigator.language || document.documentElement.lang;
}

function subscribeHostLocale() {
  const subscribe = window.tuttiExternal?.app?.subscribe;
  if (typeof subscribe !== "function") return;
  subscribe((context) => {
    const nextLocale = normalizeLocale(context?.locale || context?.language);
    if (nextLocale === locale) return;
    locale = nextLocale;
    document.documentElement.lang = locale;
    if (stage === "idle") currentAnswers = buildFallbackAnswers(currentQuestion);
    if (stage === "dealing") selectedDealingHint = randomDealingHint(selectedDealingHint);
    render();
  });
}

function assertI18nParity() {
  const baseKeys = Object.keys(messages[defaultLocale]).sort();
  for (const candidate of supportedLocales) {
    const keys = Object.keys(messages[candidate] || {}).sort();
    const missing = baseKeys.filter((key) => !keys.includes(key));
    const extra = keys.filter((key) => !baseKeys.includes(key));
    if (missing.length || extra.length) {
      throw new Error(
        `${candidate} i18n mismatch: missing=${missing.join(",")} extra=${extra.join(",")}`,
      );
    }
  }
}

function serialFor(question, choice) {
  return String(hashString(`${question}:${choice}`) % 100000).padStart(5, "0");
}

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function writeHostLog(event, details) {
  window.tuttiExternal?.logs?.write?.({
    event,
    level: "info",
    details,
  });
}
