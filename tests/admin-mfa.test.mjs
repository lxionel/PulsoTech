import test from "node:test";
import assert from "node:assert/strict";
import { resolveAdminAccess, verifyAdminAccess, verifyAdminAuthenticator, enrollAdminAuthenticator, cancelAdminEnrollment, authenticatorQrSource } from "../src/lib/admin-auth.ts";

function client({ factors = [], aal = "aal1", allowed = true, databaseMfaAllowed = true } = {}) {
  const calls = [];
  const result = (data) => ({ data, error: null });
  const fake = {
    calls,
    auth: {
      getUser: async () => result({ user: { id: "owner" } }),
      mfa: {
        listFactors: async () => result({ all: factors }),
        getAuthenticatorAssuranceLevel: async () => result({ currentLevel: aal, nextLevel: factors.some((factor) => factor.status === "verified") ? "aal2" : "aal1" }),
        enroll: async (parameters) => { calls.push(["enroll", parameters]); return result({ id: "new", totp: { secret: "PRIVATE_TEST_SECRET", qr_code: "data:image/svg+xml;utf-8,<svg><path /></svg>" } }); },
        unenroll: async ({ factorId }) => { calls.push(["remove", factorId]); return result({ id: factorId }); },
        challengeAndVerify: async (parameters) => { calls.push(["verify", parameters]); return result({}); },
      },
    },
    rpc: async (name) => { calls.push(name); return result(name === "is_store_admin_account" ? allowed : databaseMfaAllowed); },
  };
  return fake;
}
const verified = { id: "totp", factor_type: "totp", status: "verified", friendly_name: "PulsoTech administrador" };

test("first login requires enrollment, and a password-only login with an existing factor requires its code", async () => {
  const first = client();
  assert.equal((await resolveAdminAccess(first)).step, "enroll");
  await assert.rejects(verifyAdminAccess(first), (error) => error.code === "mfa_required");
  const passwordOnly = client({ factors: [verified] });
  assert.equal((await resolveAdminAccess(passwordOnly)).step, "challenge");
  await assert.rejects(verifyAdminAccess(passwordOnly), (error) => error.code === "mfa_required");
  assert.ok(!passwordOnly.calls.includes("is_store_admin"));
});

test("unverified factors and removed factors cannot turn a stale aal2 token into panel access", async () => {
  for (const factors of [[], [{ ...verified, status: "unverified" }]]) {
    assert.equal((await resolveAdminAccess(client({ factors, aal: "aal2" }))).step, "enroll");
  }
});

test("aal2 still requires the database to approve the genuine admin session", async () => {
  assert.equal((await resolveAdminAccess(client({ factors: [verified], aal: "aal2" }))).step, "ready");
  await assert.rejects(verifyAdminAccess(client({ factors: [verified], aal: "aal2", databaseMfaAllowed: false })), (error) => error.code === "forbidden");
  await assert.rejects(resolveAdminAccess(client({ factors: [verified], aal: "aal2", allowed: false })), (error) => error.code === "forbidden");
});

test("a missing migration or failing factor service never enables password-only access", async () => {
  const missing = client();
  missing.rpc = async () => ({ data: null, error: { code: "PGRST202" } });
  await assert.rejects(resolveAdminAccess(missing), (error) => error.code === "configuration");
  const unavailable = client();
  unavailable.auth.mfa.listFactors = async () => ({ data: null, error: { message: "offline" } });
  await assert.rejects(resolveAdminAccess(unavailable), (error) => error.code === "unavailable");
});

test("enrollment clears only the store's abandoned unverified factors and never an active authenticator", async () => {
  const pending = { ...verified, id: "abandoned", status: "unverified" };
  const fake = client({ factors: [pending, { ...pending, id: "other", friendly_name: "Otra aplicación" }] });
  const enrollment = await enrollAdminAuthenticator(fake);
  assert.deepEqual(fake.calls.filter(Array.isArray), [["remove", "abandoned"], ["enroll", { factorType: "totp", issuer: "PulsoTech", friendlyName: "PulsoTech administrador" }]]);
  assert.ok(enrollment.qr.startsWith("data:image/svg+xml;charset=utf-8,%3Csvg"));
  assert.equal(enrollment.secret, "PRIVATE_TEST_SECRET");
  const active = client({ factors: [verified] });
  await assert.rejects(enrollAdminAuthenticator(active), (error) => error.code === "mfa_required");
  await cancelAdminEnrollment(active, verified.id);
  assert.deepEqual(active.calls.filter(Array.isArray), []);
  await cancelAdminEnrollment(fake, "abandoned");
  assert.deepEqual(fake.calls.at(-1), ["remove", "abandoned"]);
});

test("invalid codes never contact MFA, failed codes and revoked roles do not finish login", async () => {
  const fake = client({ factors: [verified], aal: "aal2" });
  for (const code of ["", "12345", "1234567", "123 45", "abc123"]) await assert.rejects(verifyAdminAuthenticator(fake, "totp", code));
  assert.deepEqual(fake.calls, []);
  fake.auth.mfa.challengeAndVerify = async () => ({ error: { message: "invalid code" } });
  await assert.rejects(verifyAdminAuthenticator(fake, "totp", "123456"), /No pudimos verificar el código/);
  const revoked = client({ factors: [verified], aal: "aal2", databaseMfaAllowed: false });
  await assert.rejects(verifyAdminAuthenticator(revoked, "totp", "123456"), (error) => error.code === "forbidden");
});

test("a QR is rendered as an encoded image and refuses external generators or injected HTML", () => {
  assert.equal(authenticatorQrSource("data:image/svg+xml;utf-8,<svg id=\"a#b\"></svg>"), "data:image/svg+xml;charset=utf-8,%3Csvg%20id%3D%22a%23b%22%3E%3C%2Fsvg%3E");
  for (const value of ["https://external.test/qr", "javascript:alert(1)", "<svg></svg>"]) assert.throws(() => authenticatorQrSource(value));
});
