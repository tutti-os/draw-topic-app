import json
import hashlib
import os
import random
import re
import shutil
import subprocess
import tempfile
import time
from pathlib import Path


CHOICES = ["A", "B", "C", "D", "E"]
PATTERNS = [
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
]
TONES = ["coral", "cyan", "green", "gold", "orange", "violet", "blue", "rose"]
FALLBACK_ZH = [
    "别想了，点上次那家",
    "打开冰箱，能吃的都列出来",
    "今天试个新店，踩雷也认了",
    "热乎汤面，稳稳收场",
    "吃点清爽的，给下午留余地",
    "十分钟内能到的优先",
    "选一份有蔬菜的热饭",
]
FALLBACK_EN = [
    "Stop thinking and pick the place from last time",
    "Open the fridge and list what is actually edible",
    "Try a new place today, even if it is a miss",
    "Choose a warm bowl that feels easy",
    "Keep it light and leave room for the afternoon",
    "Pick the closest option within ten minutes",
    "Get something warm with vegetables",
]


def generate_cards(question, locale):
    prompt = build_agent_prompt(question, locale)
    errors = []
    try:
        cards, metadata = generate_cards_with_tutti_agent(prompt)
        return {
            "ok": True,
            "source": "tutti-agent",
            "cards": normalize_cards(cards, question, locale),
            "metadata": metadata,
        }
    except Exception as error:
        errors.append(f"tutti-agent: {error}")

    try:
        cards, metadata = generate_cards_with_codex_cli(prompt)
        return {
            "ok": True,
            "source": "codex-cli",
            "cards": normalize_cards(cards, question, locale),
            "metadata": metadata,
            "fallbackReason": "; ".join(errors),
        }
    except Exception as error:
        errors.append(f"codex-cli: {error}")

    return {
        "ok": True,
        "source": "local-fallback",
        "fallbackReason": "; ".join(errors),
        "cards": fallback_cards(question, locale),
    }


def build_agent_prompt(question, locale):
    language = "Simplified Chinese" if locale.lower().startswith("zh") else "English"
    return "\n".join(
        [
            "You are the card generator for a Tutti workspace app named 抽张主意.",
            "The user typed a small everyday decision question.",
            "Generate exactly five playful choice-card answers.",
            "For each card, choose one dot-matrix pattern that visually matches the answer.",
            "For each card, choose one color tone that emotionally matches the answer.",
            "Return ONLY valid JSON. Do not include markdown fences or commentary.",
            "Schema:",
            '{"cards":[{"choice":"A","answer":"...","pattern":"bowl","tone":"gold"},{"choice":"B","answer":"...","pattern":"friend","tone":"violet"},{"choice":"C","answer":"...","pattern":"shop","tone":"orange"},{"choice":"D","answer":"...","pattern":"spark","tone":"rose"},{"choice":"E","answer":"...","pattern":"leaf","tone":"green"}]}',
            "Rules:",
            "- Keep each answer short enough to fit on a card: 8 to 18 Chinese characters, or 5 to 12 English words.",
            "- Make the answers concrete, varied, and lighthearted, with an action the user can take immediately.",
            "- Avoid low-utility answers like asking a friend, letting someone else decide, random choice, or vague mood-based advice unless the user's question explicitly asks for that.",
            "- Match the user's actual topic. Do not default to food, restaurants, or eating unless the question is about food.",
            f"- pattern must be one of: {', '.join(PATTERNS)}.",
            f"- tone must be one of: {', '.join(TONES)}.",
            "- Pattern meanings: bowl=eating/food comfort, fridge=leftovers/home ingredients, shop=restaurants/takeout, cart=buying/shopping/orders, key=keys/locks/access, gift=gifts/surprises, coffee=coffee/tea/energy, friend=social choices, phone=calling/texting/replying, umbrella=rain/weather, leaf=light/fresh/healthy, spark=new/adventurous, clock=quick/time-boxed, route=walking/commuting/travel, map=directions/navigation/nearby, car=driving/taxi, plane=flights/airports, home=familiar/home, book=reading/study, laptop=work/writing/email/projects, bed=rest/sleep/pause, broom=clean/tidy/organize, tool=fixing/repair/building, dumbbell=exercise/fitness, medkit=health/medicine, coin=budget/money/cost, heart=preference/treat, music=songs/playlists, movie=movies/shows/videos, pet=pets/cats/dogs, shirt=clothes/outfits, sun=morning/daylight, moon=night/evening, dice=random/chance, check=decisive choices, wave=water/calm/cooling off.",
            "- Use cyan for fridge/water/cool/rest answers, green for light/fresh/study/tidy answers, orange for restaurants/takeout/spicy/shopping answers, violet for social/contact answers, coral for familiar/home answers, blue for quick/time/route/work answers, rose for new/adventurous/preference answers, and gold for decisive/budget/food comfort answers.",
            "- Do not mention that you are an AI.",
            "- Do not include unsafe, medical, legal, or financial advice.",
            f"- Output language: {language}.",
            f"User question: {question}",
        ]
    )


def generate_cards_with_tutti_agent(prompt):
    cli = os.environ.get("TUTTI_CLI", "").strip()
    if not cli:
        raise RuntimeError("TUTTI_CLI is not configured")

    timeout = int(os.environ.get("DECIDE_DECK_AGENT_TIMEOUT_SECONDS", "30"))
    start = run_tutti(cli, ["codex", "start", "--prompt", prompt], timeout=timeout)
    cards = extract_cards_from_payload(start)
    if cards:
        return cards, {"start": scrub_payload(start)}

    session_id = find_session_id(start)
    if not session_id:
        raise RuntimeError("Tutti agent did not return a session id")

    deadline = time.time() + timeout
    last_payload = None
    while time.time() < deadline:
        for command in (
            ["agent", "session", "messages", "--session-id", session_id],
            ["agent", "session-summary", "--session-id", session_id],
        ):
            try:
                payload = run_tutti(cli, command, timeout=min(5, timeout))
            except Exception:
                continue
            last_payload = payload
            cards = extract_cards_from_payload(payload)
            if cards:
                return cards, {
                    "sessionId": session_id,
                    "command": " ".join(command),
                }
        time.sleep(1.2)

    raise RuntimeError(
        "Timed out waiting for Tutti agent card JSON"
        + (f"; last payload keys={list(last_payload.keys())}" if isinstance(last_payload, dict) else "")
    )


def generate_cards_with_codex_cli(prompt):
    cli = find_codex_cli()
    if not cli:
        raise RuntimeError("Codex CLI is not configured")

    timeout = int(os.environ.get("DECIDE_DECK_CODEX_TIMEOUT_SECONDS", "30"))
    with tempfile.TemporaryDirectory(prefix="draw-topic-app-codex-") as directory:
        output_path = Path(directory) / "last-message.txt"
        result = subprocess.run(
            [
                cli,
                "exec",
                "--skip-git-repo-check",
                "--ephemeral",
                "--sandbox",
                "read-only",
                "-c",
                'approval_policy="never"',
                "--output-last-message",
                str(output_path),
                prompt,
            ],
            capture_output=True,
            input="",
            text=True,
            timeout=timeout,
        )
        if result.returncode != 0:
            raise RuntimeError((result.stderr or result.stdout or "Codex CLI command failed").strip())

        output = output_path.read_text(encoding="utf-8").strip() if output_path.exists() else result.stdout.strip()
        cards = extract_cards_from_payload({"lastMessage": output, "stdout": result.stdout})
        if not cards:
            raise RuntimeError("Codex CLI did not return card JSON")
        return cards, {"cli": cli}


def find_codex_cli():
    configured = os.environ.get("CODEX_CLI", "").strip()
    candidates = [
        configured,
        shutil.which("codex") or "",
        "/Applications/Codex.app/Contents/Resources/codex",
    ]
    for candidate in candidates:
        if candidate and Path(candidate).is_file():
            return candidate
    return ""


def run_tutti(cli, args, timeout):
    result = subprocess.run(
        [cli, "--json", *args],
        capture_output=True,
        text=True,
        timeout=timeout,
    )
    if result.returncode != 0:
        raise RuntimeError((result.stderr or result.stdout or "Tutti CLI command failed").strip())
    text = result.stdout.strip() or "{}"
    try:
        return json.loads(text)
    except json.JSONDecodeError as error:
        raise RuntimeError(f"Tutti CLI returned non-JSON output: {error}") from error


def extract_cards_from_payload(payload):
    for text in iter_text(payload):
        parsed = parse_cards_json(text)
        if parsed:
            return parsed
    return None


def parse_cards_json(text):
    if not isinstance(text, str) or '"cards"' not in text:
        return None
    candidates = [text]
    candidates.extend(match.group(0) for match in re.finditer(r"\{[\s\S]*?\"cards\"[\s\S]*?\}", text))
    for candidate in candidates:
        try:
            parsed = json.loads(candidate)
        except json.JSONDecodeError:
            continue
        cards = parsed.get("cards")
        if isinstance(cards, list) and len(cards) >= len(CHOICES):
            return cards
    return None


def iter_text(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for item in value.values():
            yield from iter_text(item)
    elif isinstance(value, list):
        for item in value:
            yield from iter_text(item)


def find_session_id(value):
    if isinstance(value, dict):
        for key, item in value.items():
            normalized = key.replace("_", "").replace("-", "").lower()
            if normalized in {"sessionid", "agentsessionid"} and isinstance(item, str):
                return item
            found = find_session_id(item)
            if found:
                return found
    elif isinstance(value, list):
        for item in value:
            found = find_session_id(item)
            if found:
                return found
    return None


def normalize_cards(cards, question, locale):
    fallback = fallback_cards(question, locale)
    used_answers = set()
    normalized = []
    for index, choice in enumerate(CHOICES):
        source = cards[index] if index < len(cards) and isinstance(cards[index], dict) else {}
        answer = str(source.get("answer") or source.get("text") or "").strip()
        if not answer or is_low_utility_answer(answer, question) or compact_key(answer) in used_answers:
            answer = first_unused_fallback(fallback, used_answers, index)
        compacted = compact_answer(answer, locale)
        used_answers.add(compact_key(compacted))
        normalized.append(
            {
                "choice": choice,
                "answer": compacted,
                "serial": serial_for(question, choice),
                "pattern": normalize_pattern(
                    source.get("pattern") or source.get("patternKey") or source.get("glyph") or source.get("icon"),
                    question,
                    answer,
                    choice,
                ),
                "tone": normalize_tone(
                    source.get("tone") or source.get("color") or source.get("palette"),
                    question,
                    answer,
                    choice,
                ),
                "patternSeed": f"{question}:{choice}:{answer}",
            }
        )
    return normalized


def fallback_cards(question, locale):
    pool = FALLBACK_ZH if locale.lower().startswith("zh") else FALLBACK_EN
    rng = random.Random(stable_hash(question or "decidedeck"))
    picked = rng.sample(pool, k=len(CHOICES))
    return [
        {
            "choice": choice,
            "answer": picked[index],
            "serial": serial_for(question, choice),
            "pattern": normalize_pattern("", question, picked[index], choice),
            "tone": normalize_tone("", question, picked[index], choice),
            "patternSeed": f"{question}:{choice}:{picked[index]}",
        }
        for index, choice in enumerate(CHOICES)
    ]


def normalize_pattern(value, question, answer, choice):
    key = re.sub(r"[^a-z]", "", str(value or "").lower())
    if key in PATTERNS:
        return key
    text = f"{question} {answer}".lower()
    if any(word in text for word in ["冰箱", "fridge", "冷藏", "剩菜"]):
        return "fridge"
    if any(word in text for word in ["伞", "雨", "天气", "umbrella", "rain", "weather"]):
        return "umbrella"
    if any(word in text for word in ["咖啡", "茶", "奶茶", "提神", "coffee", "tea", "caffeine"]):
        return "coffee"
    if any(word in text for word in ["运动", "健身", "跑步", "训练", "exercise", "workout", "run", "gym"]):
        return "dumbbell"
    if any(word in text for word in ["飞机", "航班", "机场", "远行", "plane", "flight", "airport"]):
        return "plane"
    if any(word in text for word in ["电影", "剧", "视频", "movie", "show", "video", "watch"]):
        return "movie"
    if any(word in text for word in ["衣服", "穿", "外套", "搭配", "clothes", "shirt", "wear", "outfit"]):
        return "shirt"
    if any(word in text for word in ["预算", "钱", "便宜", "贵", "省", "budget", "money", "cheap", "cost", "save"]):
        return "coin"
    if any(word in text for word in ["钥匙", "门", "锁", "入口", "key", "lock", "door", "access"]):
        return "key"
    if any(word in text for word in ["礼物", "送", "惊喜", "gift", "present", "surprise"]):
        return "gift"
    if any(word in text for word in ["咖啡", "茶", "奶茶", "提神", "coffee", "tea", "caffeine"]):
        return "coffee"
    if any(word in text for word in ["买", "购物", "下单", "逛", "purchase", "buy", "shopping", "order"]):
        return "cart"
    if any(word in text for word in ["店", "餐厅", "外卖", "shop", "restaurant", "takeout"]):
        return "shop"
    if any(word in text for word in ["电话", "联系", "消息", "回复", "call", "text", "message", "reply"]):
        return "phone"
    if any(word in text for word in ["朋友", "同事", "问", "一起", "friend", "ask", "team", "together"]):
        return "friend"
    if any(word in text for word in ["伞", "雨", "天气", "umbrella", "rain", "weather"]):
        return "umbrella"
    if any(word in text for word in ["清爽", "轻", "沙拉", "蔬", "light", "salad", "fresh"]):
        return "leaf"
    if any(word in text for word in ["家", "上次", "常去", "home", "usual", "again"]):
        return "home"
    if any(word in text for word in ["走", "路", "通勤", "出门", "去", "旅行", "walk", "route", "commute", "go", "travel"]):
        return "route"
    if any(word in text for word in ["地图", "方向", "附近", "导航", "map", "direction", "nearby", "navigate"]):
        return "map"
    if any(word in text for word in ["开车", "打车", "车", "car", "drive", "taxi", "rideshare"]):
        return "car"
    if any(word in text for word in ["飞机", "航班", "机场", "远行", "plane", "flight", "airport"]):
        return "plane"
    if any(word in text for word in ["学习", "读", "书", "课程", "笔记", "study", "read", "book", "course", "notes"]):
        return "book"
    if any(word in text for word in ["工作", "电脑", "邮件", "写", "项目", "work", "laptop", "email", "write", "project"]):
        return "laptop"
    if any(word in text for word in ["睡", "休息", "躺", "暂停", "sleep", "rest", "nap", "pause"]):
        return "bed"
    if any(word in text for word in ["收拾", "整理", "打扫", "清理", "clean", "tidy", "organize"]):
        return "broom"
    if any(word in text for word in ["修", "工具", "组装", "维修", "fix", "repair", "tool", "build"]):
        return "tool"
    if any(word in text for word in ["运动", "健身", "跑步", "训练", "exercise", "workout", "run", "gym"]):
        return "dumbbell"
    if any(word in text for word in ["医生", "药", "健康", "不舒服", "medical", "medicine", "health", "sick"]):
        return "medkit"
    if any(word in text for word in ["快", "马上", "时间", "十分钟", "倒计时", "quick", "now", "time", "minutes", "timer"]):
        return "clock"
    if any(word in text for word in ["试", "踩雷", "冒险", "new", "risk", "try"]):
        return "spark"
    if any(word in text for word in ["喜欢", "爱", "想要", "奖励", "love", "like", "want", "treat"]):
        return "heart"
    if any(word in text for word in ["音乐", "歌", "听", "music", "song", "playlist", "listen"]):
        return "music"
    if any(word in text for word in ["电影", "剧", "视频", "movie", "show", "video", "watch"]):
        return "movie"
    if any(word in text for word in ["宠物", "猫", "狗", "pet", "cat", "dog"]):
        return "pet"
    if any(word in text for word in ["衣服", "穿", "外套", "搭配", "clothes", "shirt", "wear", "outfit"]):
        return "shirt"
    if any(word in text for word in ["早", "上午", "阳光", "太阳", "morning", "sun", "daylight"]):
        return "sun"
    if any(word in text for word in ["晚上", "夜", "月", "睡前", "night", "moon", "evening", "bedtime"]):
        return "moon"
    if any(word in text for word in ["决定", "确定", "yes", "ok", "pick"]):
        return "check"
    if any(word in text for word in ["随机", "抽", "随缘", "random", "chance", "roll"]):
        return "dice"
    if any(word in text for word in ["水", "游泳", "洗", "冷静", "water", "swim", "wash", "calm"]):
        return "wave"
    if any(word in text for word in ["吃", "喝", "饭", "餐", "food", "eat", "lunch", "dinner"]):
        return "bowl"
    return PATTERNS[stable_hash(f"{question}:{answer}:{choice}") % len(PATTERNS)]


def normalize_tone(value, question, answer, choice):
    key = re.sub(r"[^a-z]", "", str(value or "").lower())
    if key in TONES:
        return key
    text = f"{question} {answer}".lower()
    if any(word in text for word in ["冰箱", "fridge", "冷藏", "剩菜", "水", "water"]):
        return "cyan"
    if any(word in text for word in ["清爽", "轻", "沙拉", "蔬", "light", "salad", "fresh"]):
        return "green"
    if any(word in text for word in ["预算", "钱", "便宜", "贵", "省", "budget", "money", "cheap", "cost", "save"]):
        return "gold"
    if any(word in text for word in ["钥匙", "门", "锁", "入口", "礼物", "送", "惊喜", "key", "lock", "door", "gift", "present"]):
        return "gold"
    if any(word in text for word in ["咖啡", "茶", "奶茶", "提神", "coffee", "tea", "caffeine"]):
        return "coral"
    if any(word in text for word in ["买", "购物", "下单", "逛", "purchase", "buy", "shopping", "order"]):
        return "orange"
    if any(word in text for word in ["店", "餐厅", "外卖", "新店", "辣", "shop", "restaurant", "takeout", "spicy"]):
        return "orange"
    if any(word in text for word in ["朋友", "同事", "问", "交给别人", "friend", "ask", "team", "someone else"]):
        return "violet"
    if any(word in text for word in ["电话", "联系", "消息", "回复", "音乐", "歌", "call", "text", "message", "music", "song"]):
        return "violet"
    if any(word in text for word in ["家", "上次", "常去", "home", "usual", "again"]):
        return "coral"
    if any(word in text for word in ["快", "马上", "时间", "十分钟", "quick", "now", "time", "minutes"]):
        return "blue"
    if any(word in text for word in ["走", "路", "通勤", "出门", "去", "旅行", "walk", "route", "commute", "go", "travel"]):
        return "blue"
    if any(word in text for word in ["睡", "休息", "躺", "暂停", "sleep", "rest", "nap", "pause"]):
        return "cyan"
    if any(word in text for word in ["伞", "雨", "天气", "晚上", "夜", "月", "umbrella", "rain", "weather", "night", "moon"]):
        return "cyan"
    if any(word in text for word in ["工作", "电脑", "邮件", "写", "项目", "work", "laptop", "email", "write", "project"]):
        return "blue"
    if any(word in text for word in ["开车", "打车", "飞机", "航班", "地图", "导航", "car", "drive", "plane", "flight", "map"]):
        return "blue"
    if any(word in text for word in ["医生", "药", "健康", "运动", "健身", "medical", "medicine", "health", "exercise", "gym"]):
        return "green"
    if any(word in text for word in ["试", "踩雷", "冒险", "new", "risk", "try"]):
        return "rose"
    if any(word in text for word in ["电影", "剧", "视频", "movie", "show", "video"]):
        return "rose"
    if any(word in text for word in ["喜欢", "爱", "想要", "奖励", "love", "like", "want", "treat"]):
        return "rose"
    if any(word in text for word in ["决定", "确定", "预算", "yes", "ok", "pick", "budget"]):
        return "gold"
    return TONES[stable_hash(f"{question}:{answer}:{choice}") % len(TONES)]


def compact_answer(answer, locale):
    answer = re.sub(r"\s+", " ", answer).strip()
    if locale.lower().startswith("zh"):
        return answer[:18]
    words = answer.split(" ")
    return " ".join(words[:10])


def first_unused_fallback(fallback, used_answers, preferred_index):
    ordered = fallback[preferred_index:] + fallback[:preferred_index]
    for card in ordered:
        answer = card["answer"]
        if compact_key(answer) not in used_answers:
            return answer
    return fallback[preferred_index]["answer"]


def is_low_utility_answer(answer, question):
    text = f"{answer}".lower()
    context = f"{question}".lower()
    social_words = ["朋友", "同事", "别人", "一起", "friend", "coworker", "someone else", "ask someone"]
    social_context = any(word in context for word in social_words)
    if not social_context and any(word in text for word in social_words):
        return True
    vague_words = ["随便", "都行", "看心情", "random", "whatever", "up to you", "anything"]
    return any(word in text for word in vague_words)


def compact_key(answer):
    return re.sub(r"\s+", "", answer).lower()


def serial_for(question, choice):
    return str(stable_hash(f"{question}:{choice}") % 100000).zfill(5)


def stable_hash(value):
    digest = hashlib.sha256(value.encode("utf-8")).hexdigest()
    return int(digest[:12], 16)


def scrub_payload(payload):
    if isinstance(payload, dict):
        return {
            key: value
            for key, value in payload.items()
            if key.lower() in {"sessionid", "id", "status", "provider", "app"}
        }
    return {}
