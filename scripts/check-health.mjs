import { readFile, writeFile } from "node:fs/promises";
import nextEnv from "@next/env";
import { checkStoreHealth } from "./lib/store-health.mjs";

try {
  const options = {};
  const args = process.argv.slice(2);
  for (let index = 0; index < args.length; index += 2) {
    if (!["--target", "--report"].includes(args[index]) || !args[index + 1] || args[index + 1].startsWith("--") || options[args[index]]) {
      throw new Error("Uso: npm run health:check -- [--target https://tienda/] [--report archivo.json]");
    }
    options[args[index]] = args[index + 1];
  }
  nextEnv.loadEnvConfig(process.cwd());
  const source = await readFile(new URL("../src/lib/supabase.ts", import.meta.url), "utf8");
  const report = await checkStoreHealth({ target: options["--target"] || "https://pulsotech.pages.dev/",
    api: process.env.NEXT_PUBLIC_SUPABASE_URL || source.match(/DEFAULT_SUPABASE_URL = "([^"]+)"/)[1],
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || source.match(/DEFAULT_SUPABASE_ANON_KEY = "([^"]+)"/)[1] });
  // Only metrics and fixed resource names; never keys or response records.
  console.log(JSON.stringify(report, null, 2));
  if (options["--report"]) await writeFile(options["--report"], JSON.stringify(report, null, 2), { flag: "wx" });
  if (!report.ok) process.exitCode = 1;
} catch {
  console.error("No se pudo completar la comprobación. Revisa la configuración pública, la red y la ruta del informe. No se modificaron datos.");
  process.exitCode = 1;
}
