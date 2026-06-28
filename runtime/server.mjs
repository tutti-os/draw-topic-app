import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { detectAgentProviders, generateCards } from "./card-agent.mjs";

const runtimeDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = process.env.DRAW_TOPIC_PROJECT_ROOT || path.resolve(runtimeDir, "..");
const packageDir = process.env.TUTTI_APP_PACKAGE_DIR || projectRoot;
const workspaceCwd = process.env.TUTTI_WORKSPACE_ROOT || projectRoot;
const host = process.env.TUTTI_APP_HOST || process.env.HOST || "127.0.0.1";
const port = Number.parseInt(process.env.TUTTI_APP_PORT || process.env.PORT || "5173", 10);
const staticDir = process.env.DRAW_TOPIC_STATIC_DIR || path.join(packageDir, process.env.TUTTI_APP_PACKAGE_DIR ? "static" : "src");
const localesDir = process.env.DRAW_TOPIC_LOCALES_DIR || path.join(packageDir, "locales");
const publicDir = process.env.DRAW_TOPIC_PUBLIC_DIR || (process.env.TUTTI_APP_PACKAGE_DIR ? packageDir : path.join(packageDir, "public"));

if (!Number.isInteger(port)) {
  throw new Error("A numeric TUTTI_APP_PORT or PORT is required");
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${host}:${port}`);
    if (request.method === "GET" && url.pathname === "/healthz") {
      writeJson(response, { ok: true });
      return;
    }
    if (request.method === "GET" && url.pathname === "/api/providers") {
      writeJson(response, await detectAgentProviders({ cwd: workspaceCwd }));
      return;
    }
    if (request.method === "POST" && url.pathname === "/api/draw") {
      const body = await readJsonBody(request);
      const question = String(body.question || "").trim();
      if (!question) {
        writeJson(response, { ok: false, error: "question_required" }, 400);
        return;
      }
      writeJson(
        response,
        await generateCards({
          question,
          locale: String(body.locale || "zh-CN"),
          provider: String(body.provider || ""),
          cwd: workspaceCwd
        })
      );
      return;
    }
    if (request.method !== "GET") {
      writeJson(response, { error: "not_found" }, 404);
      return;
    }
    await serveStatic(url.pathname, response);
  } catch (error) {
    writeJson(response, { ok: false, error: String(error?.message || error) }, 500);
  }
});

server.listen(port, host, () => {
  console.log(`抽张主意 server listening at http://${host}:${port}`);
});

async function serveStatic(route, response) {
  if (route === "/") {
    await serveFile(path.join(staticDir, "index.html"), response);
    return;
  }
  if (route === "/app.js" || route === "/styles.css") {
    await serveFile(path.join(staticDir, route.slice(1)), response);
    return;
  }
  if (route === "/icon.png" || route === "/icon.svg") {
    await serveFile(path.join(publicDir, route.slice(1)), response);
    return;
  }
  if (route.startsWith("/locales/")) {
    await serveFile(path.join(localesDir, decodeURIComponent(route.slice("/locales/".length))), response);
    return;
  }
  writeJson(response, { error: "not_found" }, 404);
}

async function serveFile(filePath, response) {
  const allowed = await isAllowedFile(filePath);
  if (!allowed) {
    writeJson(response, { error: "not_found" }, 404);
    return;
  }
  const data = await fs.readFile(filePath);
  response.writeHead(200, {
    "content-type": `${contentType(filePath)}; charset=utf-8`,
    "content-length": data.byteLength,
    "cache-control": "no-store"
  });
  response.end(data);
}

async function isAllowedFile(filePath) {
  const resolved = path.resolve(filePath);
  const bases = [staticDir, localesDir, publicDir].map((base) => path.resolve(base));
  if (!bases.some((base) => resolved === base || resolved.startsWith(`${base}${path.sep}`))) return false;
  try {
    return (await fs.stat(resolved)).isFile();
  } catch {
    return false;
  }
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".html") return "text/html";
  if (ext === ".js") return "text/javascript";
  if (ext === ".css") return "text/css";
  if (ext === ".json") return "application/json";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".png") return "image/png";
  return "application/octet-stream";
}

function writeJson(response, payload, status = 200) {
  const data = Buffer.from(JSON.stringify(payload));
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": data.byteLength
  });
  response.end(data);
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.byteLength;
    if (size > 65536) throw new Error("request_body_too_large");
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}
