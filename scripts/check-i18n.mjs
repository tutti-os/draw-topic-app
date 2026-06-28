import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const localesDir = path.join(rootDir, "locales");
const defaultLocale = "zh-CN";

function flatten(value, prefix = "") {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [prefix];
  }
  return Object.entries(value).flatMap(([key, child]) =>
    flatten(child, prefix ? `${prefix}.${key}` : key),
  );
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

const locales = (await readdir(localesDir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const defaultMessages = await readJson(
  path.join(localesDir, defaultLocale, "app.json"),
);
const defaultKeys = flatten(defaultMessages).sort();

for (const locale of locales) {
  const messages = await readJson(path.join(localesDir, locale, "app.json"));
  const keys = flatten(messages).sort();
  const missing = defaultKeys.filter((key) => !keys.includes(key));
  const extra = keys.filter((key) => !defaultKeys.includes(key));
  if (missing.length || extra.length) {
    throw new Error(
      `${locale} i18n mismatch: missing=${missing.join(",")} extra=${extra.join(",")}`,
    );
  }
}

console.log(`i18n keys match for ${locales.join(", ")}`);
