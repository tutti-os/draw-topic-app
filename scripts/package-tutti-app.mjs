import { chmod, cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = path.join(rootDir, "build", "tutti-app", "package");

await rm(path.join(rootDir, "build", "tutti-app"), {
  recursive: true,
  force: true,
});
await mkdir(packageRoot, { recursive: true });

await cp(path.join(rootDir, "tutti.app.json"), path.join(packageRoot, "tutti.app.json"));
await cp(path.join(rootDir, "AGENTS.md"), path.join(packageRoot, "AGENTS.md"));
await cp(path.join(rootDir, "public", "icon.png"), path.join(packageRoot, "icon.png"));
await cp(path.join(rootDir, "public", "icon.svg"), path.join(packageRoot, "icon.svg"));
await cp(path.join(rootDir, "locales"), path.join(packageRoot, "locales"), {
  recursive: true,
});
await cp(path.join(rootDir, "src"), path.join(packageRoot, "static"), {
  recursive: true,
});
await cp(path.join(rootDir, "runtime", "server.py"), path.join(packageRoot, "server.py"));
await cp(path.join(rootDir, "runtime", "card_agent.py"), path.join(packageRoot, "card_agent.py"));
await cp(
  path.join(rootDir, "runtime", "bootstrap.sh"),
  path.join(packageRoot, "bootstrap.sh"),
);

await writeFile(
  path.join(packageRoot, "PACKAGE.md"),
  [
    "# 抽张主意 Package",
    "",
    "This is the generated Tutti workspace app package.",
    "",
    "- `bootstrap.sh` starts `server.py` through `$TUTTI_APP_PYTHON`.",
    "- `/healthz` is the runtime healthcheck.",
    "- `card_agent.py` calls `$TUTTI_CLI` or Codex CLI for generation of five choice cards with local fallback.",
    "- `static/` contains the browser app.",
    "- `icon.png` and `icon.svg` contain the app icon assets.",
    "- `locales/` contains manifest metadata and in-app copy.",
    "",
  ].join("\n"),
);

await chmod(path.join(packageRoot, "bootstrap.sh"), 0o755);

console.log(`Tutti app package written to ${packageRoot}`);
