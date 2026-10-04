import test from "node:test";
import assert from "node:assert/strict";
import { adminCaptchaConfig, signInAdmin, requestAdminRecovery, authRetrySeconds } from "../src/lib/admin-captcha.ts";

const config = adminCaptchaConfig("0x4AAAAAAAAAAAAAAAAAAAAAAA");
const now = 1000000;
function client() {
  const calls = [];
  return {
    calls,
    auth: {
      signInWithPassword: async (credentials) => { calls.push(["login", credentials]); return { error: null }; },
      resetPasswordForEmail: async (email, options) => { calls.push(["recover", email, options]); return { error: null }; },
    },
  };
}

test("required CAPTCHA never submits login or recovery with missing, expired or future tokens", async () => {
  const fake = client();
  for (const proof of [null, { token: "", issuedAt: now }, { token: "expired", issuedAt: now - 240000 }, { token: "future", issuedAt: now + 1 }, { token: "invalid", issuedAt: NaN }]) {
    await assert.rejects(signInAdmin(fake, "owner@example.com", "private", config, proof, now));
    await assert.rejects(requestAdminRecovery(fake, "owner@example.com", "https://store.test/admin/", config, proof, now));
  }
  assert.deepEqual(fake.calls, []);
});

test("both Auth endpoints receive the fresh CAPTCHA token for verification by Supabase", async () => {
  const fake = client();
  const proof = { token: "fresh-single-use-token", issuedAt: now - 1000 };
  await signInAdmin(fake, " owner@example.com ", "private", config, proof, now);
  await requestAdminRecovery(fake, " owner@example.com ", "https://store.test/PulsoTech/Lionel260606/", config, proof, now);
  assert.deepEqual(fake.calls, [
    ["login", { email: "owner@example.com", password: "private", options: { captchaToken: proof.token } }],
    ["recover", "owner@example.com", { redirectTo: "https://store.test/PulsoTech/Lionel260606/", captchaToken: proof.token }],
  ]);
});

test("declaring CAPTCHA required with no public key fails closed while unconfigured setup remains usable", async () => {
  const fake = client();
  const required = adminCaptchaConfig("", true);
  assert.ok(required.error);
  await assert.rejects(signInAdmin(fake, "owner@example.com", "private", required, null));
  await assert.rejects(requestAdminRecovery(fake, "owner@example.com", "https://store.test/", required, null));
  assert.deepEqual(fake.calls, []);
  await signInAdmin(fake, "owner@example.com", "private", adminCaptchaConfig(), null);
  assert.deepEqual(fake.calls[0], ["login", { email: "owner@example.com", password: "private" }]);
});

test("test CAPTCHA keys and malformed configuration cannot enable login in production", async () => {
  const fake = client();
  for (const key of ["1x00000000000000000000AA", "2x00000000000000000000AB", "1x00000000000000000000BB", "2x00000000000000000000BB", "3x00000000000000000000FF", "https://bad.test/key"]) {
    const invalid = adminCaptchaConfig(key, true, true);
    assert.ok(invalid.error);
    await assert.rejects(signInAdmin(fake, "owner@example.com", "private", invalid, { token: "token", issuedAt: now }, now));
  }
  assert.deepEqual(fake.calls, []);
  assert.equal(adminCaptchaConfig("1x00000000000000000000AA", true, false).error, "");
});

test("Auth rate limits get a retry pause without treating ordinary bad credentials as a server block", () => {
  assert.equal(authRetrySeconds({ status: 429 }), 60);
  assert.equal(authRetrySeconds({ code: "over_request_rate_limit" }), 60);
  assert.equal(authRetrySeconds({ code: "over_email_send_rate_limit" }), 60);
  assert.equal(authRetrySeconds({ status: 400, code: "invalid_credentials" }), 0);
  assert.equal(authRetrySeconds(null), 0);
});
