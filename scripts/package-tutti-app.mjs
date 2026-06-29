import { chmod, cp, mkdir, readFile, realpath, rm, writeFile } from "node:fs/promises";
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
await cp(path.join(rootDir, "runtime", "server.mjs"), path.join(packageRoot, "server.mjs"));
await cp(path.join(rootDir, "runtime", "card-agent.mjs"), path.join(packageRoot, "card-agent.mjs"));
await cp(
  path.join(rootDir, "runtime", "bootstrap.sh"),
  path.join(packageRoot, "bootstrap.sh"),
);
await copyDependencyClosure("@tutti-os/agent-acp-kit");

await writeFile(
  path.join(packageRoot, "PACKAGE.md"),
  [
    "# 抽张主意 Package",
    "",
    "This is the generated Tutti workspace app package.",
    "",
    "- `bootstrap.sh` starts `server.mjs` through `$TUTTI_APP_NODE`.",
    "- `/healthz` is the runtime healthcheck.",
    "- `card-agent.mjs` uses `@tutti-os/agent-acp-kit` to detect and run Claude Code or Codex, with local fallback.",
    "- `static/` contains the browser app.",
    "- `node_modules/` contains the packaged runtime dependency closure.",
    "- `icon.png` and `icon.svg` contain the app icon assets.",
    "- `locales/` contains manifest metadata and in-app copy.",
    "",
  ].join("\n"),
);

await chmod(path.join(packageRoot, "bootstrap.sh"), 0o755);

console.log(`Tutti app package written to ${packageRoot}`);

async function copyDependencyClosure(rootPackageName) {
  const copied = new Set();
  await copyPackage(rootPackageName, rootDir);

  async function copyPackage(packageName, fromDir) {
    if (copied.has(packageName)) return;
    const sourceDir = await resolvePackageDir(packageName, fromDir);
    const packageJson = JSON.parse(await readFile(path.join(sourceDir, "package.json"), "utf8"));
    copied.add(packageName);

    const destinationDir = path.join(packageRoot, "node_modules", ...packageName.split("/"));
    await mkdir(path.dirname(destinationDir), { recursive: true });
    await rm(destinationDir, { recursive: true, force: true });
    await cp(sourceDir, destinationDir, {
      recursive: true,
      dereference: true,
      filter: (source) => shouldCopyPackagePath(packageName, path.relative(sourceDir, source)),
    });

    for (const dependency of Object.keys(packageJson.dependencies || {})) {
      await copyPackage(dependency, sourceDir);
    }
  }
}

function shouldCopyPackagePath(packageName, relativePath) {
  const parts = relativePath.split(path.sep);
  if (parts.includes("node_modules")) return false;
  if (packageName !== "@anthropic-ai/claude-agent-sdk") return true;
  return relativePath !== "cli.js" && parts[0] !== "vendor";
}

async function resolvePackageDir(packageName, fromDir) {
  const parts = packageName.split("/");
  for (const base of [fromDir, rootDir]) {
    let directory = base;
    while (directory !== path.dirname(directory)) {
      try {
        return await realpath(path.join(directory, "node_modules", ...parts));
      } catch {
        directory = path.dirname(directory);
      }
    }
  }
  throw new Error(`Cannot resolve package dependency ${packageName}`);
}
