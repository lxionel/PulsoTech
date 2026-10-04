import { readFile, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { emitKeypressEvents } from "node:readline";
import { decryptStoreBackup, backupSummary, createRecoverySql, MAX_OPERATIONAL_BACKUP_BYTES } from "../src/lib/store-backup.ts";

async function readPassword() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error("Ejecuta esta herramienta en una terminal interactiva. No pases contraseñas como argumentos.");
  process.stdout.write("Contraseña de la copia (no se mostrará): ");
  emitKeypressEvents(process.stdin);
  const wasRaw = process.stdin.isRaw;
  process.stdin.setRawMode(true);
  process.stdin.resume();
  return new Promise((resolvePassword, reject) => {
    let password = "";
    const finish = (cancelled) => {
      process.stdin.off("keypress", keypress);
      process.stdin.setRawMode(Boolean(wasRaw));
      process.stdin.pause();
      process.stdout.write("\n");
      if (cancelled) reject(new Error("Operación cancelada.")); else resolvePassword(password);
      password = "";
    };
    const keypress = (character, key = {}) => {
      if (key.ctrl && key.name === "c") return finish(true);
      if (key.name === "return" || key.name === "enter") return finish(false);
      if (key.name === "backspace") { password = [...password].slice(0, -1).join(""); return; }
      if (!key.ctrl && !key.meta && typeof character === "string" && !/[\x00-\x1f\x7f]/.test(character)) password += character;
      if (password.length > 1024) finish(true);
    };
    process.stdin.on("keypress", keypress);
  });
}

try {
  const args = process.argv.slice(2);
  if (![1, 3].includes(args.length) || (args.length === 3 && args[1] !== "--sql")) throw new Error('Uso: npm run backup:verify -- "C:\\ruta\\archivo.pulsobackup" [--sql "C:\\ruta\\copia.recovery.sql"]');
  const file = resolve(args[0]);
  if ((await stat(file)).size > MAX_OPERATIONAL_BACKUP_BYTES * 1.4 + 4096) throw new Error("Archivo demasiado grande.");
  const snapshot = await decryptStoreBackup(await readFile(file, "utf8"), await readPassword());
  const counts = backupSummary(snapshot);
  process.stdout.write(`Copia verificada: ${snapshot.createdAt}\nProductos: ${counts.products}; ventas: ${counts.sales}; códigos: ${counts.operations}; reclamos: ${counts.complaints}.\n`);
  if (args[2]) {
    const target = resolve(args[2]);
    if (!target.endsWith(".recovery.sql")) throw new Error("El archivo de recuperación debe terminar en .recovery.sql.");
    await writeFile(target, createRecoverySql(snapshot), { encoding: "utf8", flag: "wx", mode: 0o600 });
    process.stdout.write("SQL privado generado. No se ha ejecutado ni se ha conectado a ninguna base de datos. Úsalo solo en un proyecto de recuperación vacío y custodia este archivo sin cifrar.\n");
  }
} catch (failure) {
  process.stderr.write(`${failure instanceof Error ? failure.message : "No se pudo verificar la copia."}\n`);
  process.exitCode = 1;
}
