import test from "node:test";
import assert from "node:assert/strict";
import { createComplaintHandler } from "../supabase/functions/submit-complaint/index.ts";

const origin = "http://localhost:3000";
const submission = { name: "Consumidor de prueba", documentType: "DNI", documentNumber: "12345678", email: "test@example.com", phone: "999999999", address: "Dirección de prueba", product: "Modelo de prueba", kind: "reclamo", detail: "Falla de prueba", request: "Solicito revisión", amount: 100, isMinor: false, confirmed: true, website: "" };
const request = (body = { submission, captchaToken: "token-de-prueba" }, requestOrigin = origin) => new Request("https://project.test/functions/v1/submit-complaint", { method: "POST", headers: { origin: requestOrigin, "content-type": "application/json" }, body: JSON.stringify(body) });
function setup(overrides = {}, proof = { success: true, hostname: "localhost", action: "complaint" }, saveOk = true) {
  const env = { COMPLAINT_ALLOWED_ORIGINS: origin, COMPLAINT_PROVIDER_RUC: "20123456789", TURNSTILE_SECRET_KEY: "unit-test-secret", SUPABASE_URL: "https://project.test", SUPABASE_SERVICE_ROLE_KEY: "unit-test-service-key", ...overrides };
  const calls = [];
  const handler = createComplaintHandler({ env: (name) => env[name], fetch: async (url, options) => {
    calls.push({ url, options });
    return url.includes("siteverify") ? Response.json(proof) : Response.json(saveOk ? [{ id: "uuid", reference: 1, created_at: "2026-10-04T12:00:00Z" }] : { error: "private database details" }, { status: saveOk ? 201 : 500 });
  } });
  return { handler, calls };
}

test("the complaint endpoint fails closed until the provider and secret are configured", async () => {
  for (const override of [{ COMPLAINT_PROVIDER_RUC: "" }, { TURNSTILE_SECRET_KEY: "" }, { SUPABASE_SERVICE_ROLE_KEY: "" }]) {
    const { handler, calls } = setup(override);
    assert.equal((await handler(request())).status, 503);
    assert.equal(calls.length, 0);
  }
});

test("unapproved origins, invalid fields and oversized bodies never contact the database", async () => {
  const { handler, calls } = setup();
  assert.equal((await handler(request(undefined, "https://foreign.test"))).status, 403);
  for (const invalid of [{ ...submission, amount: -1 }, { ...submission, email: "invalid" }, { ...submission, name: {} }, { ...submission, isMinor: true }, { ...submission, documentNumber: "short" }, { ...submission, confirmed: false }, { ...submission, website: "spam" }]) assert.equal((await handler(request({ submission: invalid, captchaToken: "test" }))).status, 400);
  assert.equal((await handler(request({ submission, extra: "a".repeat(25000) }))).status, 400);
  assert.equal(calls.length, 0);
});

test("failed CAPTCHA, foreign hostname and wrong action cannot register a complaint", async () => {
  for (const proof of [{ success: false }, { success: true, hostname: "foreign.test", action: "complaint" }, { success: true, hostname: "localhost", action: "login" }]) {
    const { handler, calls } = setup({}, proof);
    assert.equal((await handler(request())).status, 400);
    assert.equal(calls.length, 1);
    assert.ok(calls[0].url.includes("siteverify"));
  }
});

test("a receipt is returned only after a successful private insertion and contains no credentials", async () => {
  const { handler, calls } = setup();
  const response = await handler(request());
  assert.equal(response.status, 201);
  const receipt = await response.json();
  assert.equal(receipt.reference, "PT-000001");
  assert.equal(receipt.submission.name, submission.name);
  assert.equal("confirmed" in receipt.submission, false);
  assert.equal(calls.length, 2);
  assert.equal(calls[1].options.headers.Authorization, "Bearer unit-test-service-key");
  assert.doesNotMatch(JSON.stringify(receipt), /unit-test-secret|unit-test-service-key|captchaToken/);
  const failed = setup({}, undefined, false);
  const rejection = await failed.handler(request());
  assert.equal(rejection.status, 503);
  assert.doesNotMatch(await rejection.text(), /private database details|PT-000001/);
});
