import { spawnSync } from "node:child_process";
import "./prepare-catalog-media.mjs";

// npm_execpath identifies npm without launching a shell or interpolating commands.
if (!process.env.npm_execpath) throw new Error("Ejecuta npm run build:cloudflare.");
const result = spawnSync(process.execPath, [process.env.npm_execpath, "run", "build"], {
  env: { ...process.env, NEXT_PUBLIC_BASE_PATH: "" }, stdio: "inherit",
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
