import test from "node:test";
import assert from "node:assert/strict";
import { AdminAccessError, verifyAdminAccess, isPublicSupabaseKey } from "../src/lib/admin-auth.ts";

function client(user, allowed, permissionError = null) {
  let calls = 0;
  return {
    auth: {
      getUser: async () => ({ data: { user }, error: null }),
      mfa: {
        listFactors: async () => ({ data: { all: [{ id: "totp", factor_type: "totp", status: "verified" }] }, error: null }),
        getAuthenticatorAssuranceLevel: async () => ({ data: { currentLevel: "aal2", nextLevel: "aal2" }, error: null }),
      },
    },
    rpc: async (name) => { assert.ok(["is_store_admin_account", "is_store_admin"].includes(name)); calls++; return { data: allowed, error: permissionError }; },
    calls: () => calls,
  };
}

test("a stored authenticated flag or cached session cannot replace server verification", async () => {
  const fake = client(null, true);
  fake.auth.getSession = async () => ({ data: { session: { user: { id: "forged" } } } });
  await assert.rejects(verifyAdminAccess(fake), (error) => error instanceof AdminAccessError && error.code === "signed_out");
  assert.equal(fake.calls(), 0);
});

test("signed-in users and self-assigned metadata are denied without the database role", async () => {
  await assert.rejects(verifyAdminAccess(client({ id: "ordinary", user_metadata: { is_admin: true, role: "admin" } }, false)),
    (error) => error.code === "forbidden");
});

test("unknown or failing permissions deny access instead of enabling a local fallback", async () => {
  for (const allowed of [null, undefined, "true", 1, []]) {
    await assert.rejects(verifyAdminAccess(client({ id: "user" }, allowed)), (error) => error.code === "forbidden");
  }
  await assert.rejects(verifyAdminAccess(client({ id: "user" }, true, { message: "missing migration" })),
    (error) => error.code === "unavailable");
});

test("only a verified Auth user with an explicit admin permission is accepted", async () => {
  const user = { id: "authorized", email: "admin@example.com" };
  assert.equal(await verifyAdminAccess(client(user, true)), user);
  const failed = client(user, true);
  failed.auth.getUser = async () => ({ data: { user }, error: { message: "expired" } });
  await assert.rejects(verifyAdminAccess(failed), (error) => error.code === "signed_out");
});

test("browser configuration accepts public keys and rejects secret/service role keys", () => {
  const jwt = (role) => `header.${Buffer.from(JSON.stringify({ role })).toString("base64url")}.signature`;
  assert.equal(isPublicSupabaseKey("sb_publishable_example"), true);
  assert.equal(isPublicSupabaseKey(jwt("anon")), true);
  for (const key of ["sb_secret_example", jwt("service_role"), jwt("authenticated"), "invalid", "sb_publishable_"]) {
    assert.equal(isPublicSupabaseKey(key), false);
  }
});
