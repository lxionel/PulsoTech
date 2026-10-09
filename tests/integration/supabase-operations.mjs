import assert from "node:assert/strict";
import { createHmac, randomBytes } from "node:crypto";
import { readFile, appendFile, realpath } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import { addCartItem, inspectCheckout } from "../../src/lib/cart-stock.ts";
import { productGallery } from "../../src/lib/product-media.ts";
import { salesForAccounting } from "../../src/lib/sales-validation.ts";

const checks = [];
let stage = "isolation guard";
const container = "supabase_db_pulsotech-ci";
const pause = ms => new Promise(resolvePause => setTimeout(resolvePause, ms));
function command(binary, args, input) {
  const result = spawnSync(binary, args, { input, encoding: "utf8", timeout: 30000, maxBuffer: 4 * 1024 * 1024 });
  if (result.status !== 0) throw new Error("Isolated command failed.");
  return result.stdout;
}
function sql(query) {
  return command("docker", ["exec", "-i", container, "psql", "-U", "postgres", "-d", "postgres", "-X", "-qAt", "-v", "ON_ERROR_STOP=1"], query).trim();
}
function success(response) {
  assert.equal(response.error, null, `API failure during ${stage}`);
  return response.data;
}
function totp(secret, now = Date.now()) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const character of secret.toUpperCase().replace(/=+$/, "")) {
    const index = alphabet.indexOf(character);
    assert.ok(index >= 0);
    bits += index.toString(2).padStart(5, "0");
  }
  const bytes = Buffer.from((bits.match(/.{8}/g) || []).map(byte => parseInt(byte, 2)));
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(now / 30000)));
  const digest = createHmac("sha1", bytes).update(counter).digest();
  const offset = digest.at(-1) & 15;
  return String((digest.readUInt32BE(offset) & 0x7fffffff) % 1000000).padStart(6, "0");
}
const sale = (id, quantity = 1, total = 100 * quantity) => ({
  id, productName: "Client name", quantity, total, channel: "Web", customerName: "Synthetic customer",
  date: "2026-10-08", timestamp: 1791496800000, deliveryStatus: "pending",
});
const record = (client, request, product = "qa-audio", price = 100) => client.rpc("record_sale", {
  p_sale: request, p_product_id: product, p_expected_price: price,
});

try {
  // No hosted URL, credential, backup or browser override is accepted by this test.
  assert.equal(process.env.GITHUB_ACTIONS, "true");
  const runnerTemp = await realpath(process.env.RUNNER_TEMP);
  const workdir = await realpath(process.env.PULSOTECH_CI_WORKDIR);
  assert.equal(workdir, resolve(runnerTemp, "pulsotech-isolated"));
  assert.ok(relative(runnerTemp, workdir) && !relative(runnerTemp, workdir).startsWith(".."));
  const config = await readFile(resolve(workdir, "supabase/config.toml"), "utf8");
  assert.match(config, /^project_id = "pulsotech-ci"$/m);
  const local = JSON.parse(command("supabase", ["status", "--workdir", workdir, "--output", "json"]));
  const api = new URL(local.API_URL);
  assert.equal(api.origin, "http://127.0.0.1:54321");
  assert.ok(local.ANON_KEY && local.SERVICE_ROLE_KEY);
  const localFetch = (input, init) => {
    assert.equal(new URL(typeof input === "string" || input instanceof URL ? input : input.url).origin, api.origin);
    return fetch(input, { ...init, redirect: "error", signal: AbortSignal.timeout(10000) });
  };
  const client = key => createClient(api.origin, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }, global: { fetch: localFetch },
  });
  const service = client(local.SERVICE_ROLE_KEY);
  const anon = client(local.ANON_KEY);
  const admin = client(local.ANON_KEY);
  const ordinary = client(local.ANON_KEY);

  stage = "install current schema";
  for (const file of ["supabase_schema.sql", "supabase/activate-atomic-sales.sql", "supabase/activate-backups.sql", "supabase/activate-commerce.sql", "supabase/activate-complaints.sql"]) {
    sql(await readFile(new URL(`../../${file}`, import.meta.url), "utf8"));
  }
  for (let attempt = 0; attempt < 30; attempt++) {
    if (!(await anon.rpc("is_store_admin_account")).error) break;
    await pause(250);
  }
  assert.equal(success(await anon.rpc("is_store_admin_account")), false);
  checks.push("current schema installed with real PostgreSQL and PostgREST");

  stage = "create synthetic Auth accounts";
  const password = randomBytes(24).toString("base64url");
  const owner = success(await service.auth.admin.createUser({ email: "admin@example.invalid", password, email_confirm: true })).user;
  success(await service.auth.admin.createUser({ email: "ordinary@example.invalid", password, email_confirm: true }));
  assert.match(owner.id, /^[0-9a-f-]{36}$/);
  sql(`insert into public.store_admins(user_id) values ('${owner.id}');`);
  success(await admin.auth.signInWithPassword({ email: "admin@example.invalid", password }));
  success(await ordinary.auth.signInWithPassword({ email: "ordinary@example.invalid", password }));
  assert.equal(success(await admin.rpc("is_store_admin_account")), true);
  assert.ok((await record(admin, sale("VTA-password-only"))).error);
  assert.deepEqual(success(await admin.from("store_settings").select("key").eq("key", "sales_records")), []);
  assert.ok((await record(anon, sale("VTA-anon"))).error);
  checks.push("anonymous and password-only sessions cannot register sales");

  stage = "real TOTP enrollment and verification";
  assert.equal(totp("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ", 59000), "287082"); // RFC 6238 SHA-1 vector.
  for (const account of [admin, ordinary]) {
    const factor = success(await account.auth.mfa.enroll({ factorType: "totp" }));
    success(await account.auth.mfa.challengeAndVerify({ factorId: factor.id, code: totp(factor.totp.secret) }));
    assert.equal(success(await account.auth.mfa.getAuthenticatorAssuranceLevel()).currentLevel, "aal2");
  }
  assert.equal(success(await admin.rpc("is_store_admin")), true);
  assert.equal(success(await ordinary.rpc("is_store_admin")), false);
  assert.ok((await record(ordinary, sale("VTA-not-admin"))).error);
  checks.push("Auth issues real aal2 sessions; MFA does not grant administrator membership");

  stage = "catalog edits and per-color galleries";
  const colors = [
    { name: "Negro", hex: "#111111", image: "/qa-black-1.png", images: ["/qa-black-1.png", "/qa-black-2.png"] },
    { name: "Blanco", hex: "#ffffff", image: "/qa-white-1.png", images: ["/qa-white-1.png", "/qa-white-2.png"] },
  ];
  const row = { id: "qa-audio", name: "Synthetic audio", slug: "synthetic-audio", price: 100, stock_count: 3, in_stock: true, colors, images: ["/qa-general.png"] };
  success(await admin.from("products").insert(row));
  success(await admin.from("products").update({ subtitle: "Synthetic edit" }).eq("id", row.id));
  const saved = success(await anon.from("products").select("*").eq("id", row.id).single());
  assert.equal(saved.subtitle, "Synthetic edit");
  assert.deepEqual(productGallery(saved, 0, "/empty.png"), colors[0].images);
  assert.deepEqual(productGallery(saved, 1, "/empty.png"), colors[1].images);
  assert.deepEqual(productGallery(saved, null, "/empty.png"), row.images);
  assert.ok((await ordinary.from("products").insert({ ...row, id: "qa-forbidden" })).error);
  const unauthorizedUpdate = await ordinary.from("products").update({ price: 1 }).eq("id", row.id).select("id");
  assert.ok(unauthorizedUpdate.error || unauthorizedUpdate.data.length === 0);
  checks.push("administrator saves and edits galleries; visitors read only the chosen color");

  stage = "checkout totals and confirmed sale";
  const product = { ...saved, stockCount: saved.stock_count, inStock: saved.in_stock };
  const coupon = { id: "qa", code: "QA10", discountType: "percentage", discountValue: 10, minPurchase: 50, isActive: true };
  success(await admin.from("store_settings").upsert({ key: "coupons", value: [coupon] }));
  const items = addCartItem([], [product], product.id, colors[0], 2).items;
  const order = inspectCheckout(items, [product], coupon, success(await anon.from("store_settings").select("value").eq("key", "coupons").single()).value);
  assert.equal(order.total, 180);
  assert.equal(order.issues.size, 0);
  const request = sale("VTA-confirmed", 2, order.total);
  const first = success(await record(admin, request));
  assert.equal(first.sale.productName, row.name);
  assert.equal(first.sale.total, 180);
  assert.equal(first.stock.stockCount, 1);
  assert.equal(first.replayed, false);
  const replay = success(await record(admin, request));
  assert.equal(replay.replayed, true);
  assert.equal(replay.stock.stockCount, 1);
  assert.ok((await record(admin, sale("VTA-insufficient", 2))).error);
  assert.ok((await record(admin, sale("VTA-price"), row.id, 99)).error);
  checks.push("quantity, coupon, confirmed stock, idempotency and stale-price checks pass over HTTP");

  stage = "cancelled sales and protected history";
  const cancelled = success(await admin.rpc("change_sale_status", { p_id: request.id, p_status: "cancelled" }));
  assert.equal(salesForAccounting(cancelled.records).length, 0);
  assert.equal(success(await anon.from("products").select("stock_count").eq("id", row.id).single()).stock_count, 1);
  const overwrite = await admin.from("store_settings").update({ value: [] }).eq("key", "sales_records").select("key");
  assert.ok(overwrite.error || overwrite.data.length === 0);
  assert.ok((await admin.from("sale_operations").select("id")).error);
  assert.deepEqual(success(await ordinary.from("store_settings").select("key").eq("key", "sales_records")), []);
  assert.deepEqual(success(await anon.from("store_settings").select("key").eq("key", "sales_records")), []);
  checks.push("cancellation excludes revenue without restoring stock; history cannot be overwritten directly");

  stage = "last-unit race across independent PostgreSQL connections";
  success(await admin.from("products").insert({ ...row, id: "qa-race", slug: "synthetic-race", stock_count: 1 }));
  // Delay only a synthetic product to observe overlapping real backend connections.
  sql(`create function public.qa_hold_stock() returns trigger language plpgsql as $$begin perform pg_sleep(2); return new; end$$;
    create trigger qa_hold_stock before update on public.products for each row when (old.id='qa-race') execute function public.qa_hold_stock();`);
  const session = success(await admin.auth.getSession()).session;
  const second = client(local.ANON_KEY);
  success(await second.auth.setSession({ access_token: session.access_token, refresh_token: session.refresh_token }));
  const pending = Promise.all([record(admin, sale("VTA-race-a"), "qa-race"), record(second, sale("VTA-race-b"), "qa-race")]);
  let observedPids = [];
  for (let attempt = 0; attempt < 15; attempt++) {
    await pause(100);
    observedPids = JSON.parse(sql("select coalesce(json_agg(pid),'[]') from pg_stat_activity where usename='authenticator' and state='active' and query like '%record_sale%';"));
    if (new Set(observedPids).size >= 2) break;
  }
  const race = await pending;
  assert.ok(new Set(observedPids).size >= 2);
  assert.equal(race.filter(result => !result.error).length, 1);
  assert.equal(race.filter(result => result.error).length, 1);
  const stock = success(await anon.from("products").select("stock_count,in_stock").eq("id", "qa-race").single());
  assert.deepEqual(stock, { stock_count: 0, in_stock: false });
  sql("drop trigger qa_hold_stock on public.products; drop function public.qa_hold_stock();");
  checks.push("two overlapping PostgreSQL backends compete for the last unit; exactly one sale succeeds");

  stage = "complaint data access and backup";
  const complaint = success(await service.from("complaints").insert({ provider: { synthetic: true }, submission: { synthetic: true } }).select("id").single());
  assert.ok((await anon.from("complaints").select("id")).error);
  assert.deepEqual(success(await ordinary.from("complaints").select("id")), []);
  success(await admin.from("complaints").update({ status: "answered", response: "Synthetic response" }).eq("id", complaint.id));
  assert.ok((await admin.from("complaints").update({ provider: { altered: true } }).eq("id", complaint.id)).error);
  const snapshot = success(await admin.rpc("export_store_backup"));
  assert.equal(snapshot.tables.complaints[0].response, "Synthetic response");
  assert.equal(snapshot.tables.products.length, 2);
  assert.equal(snapshot.tables.sale_operations.length, 2);
  assert.equal(snapshot.tables.store_settings.find(item => item.key === "sales_records").value.length, 2);
  assert.ok((await ordinary.rpc("export_store_backup")).error);
  assert.ok((await anon.rpc("export_store_backup")).error);
  checks.push("complaint data and operational export remain restricted to the MFA administrator");

  stage = "synthetic record removal";
  success(await admin.rpc("remove_sale_record", { p_id: request.id }));
  assert.ok((await record(admin, request)).error);
  success(await admin.rpc("clear_sale_records"));
  assert.equal(success(await admin.rpc("export_store_backup")).tables.sale_operations.length, 2);
  success(await admin.from("products").delete().eq("id", row.id));
  assert.deepEqual(success(await anon.from("products").select("id").eq("id", row.id)), []);
  checks.push("removal preserves retry identities and administrator product deletion works");

  const report = { passed: true, checks, syntheticOnly: true, hostedProjectsContacted: false, browserTest: false };
  console.log(JSON.stringify(report, null, 2));
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY,
    `## Isolated Supabase verification\n\n${checks.map(check => `- Passed: ${check}`).join("\n")}\n\nSynthetic records only. No hosted project contacted. Browser flow and public CAPTCHA remain separate checks.\n`);
} catch {
  // Auth responses, command output and exception objects can contain ephemeral credentials.
  console.error(`Isolated Supabase verification failed during: ${stage}. Credentials and private payloads were not logged.`);
  process.exitCode = 1;
}
