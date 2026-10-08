import test from "node:test";
import assert from "node:assert/strict";
import { createCatalogRefresh } from "../src/lib/catalog-refresh.ts";

function harness(refresh = async () => {}) {
  let time = 0, active = true, calls = 0;
  const timers = new Set();
  const sync = createCatalogRefresh({ refresh: async () => { calls++; return refresh(); }, isActive: () => active, now: () => time, random: () => 0.5,
    schedule: (callback, delay) => { const timer = { callback, delay }; timers.add(timer); return () => timers.delete(timer); } });
  return { sync, timers, calls: () => calls, setTime: value => { time = value; }, setActive: value => { active = value; },
    tick: async () => { const timer = [...timers][0]; assert.ok(timer); timers.delete(timer); time += timer.delay; timer.callback(); await new Promise(resolve => setImmediate(resolve)); } };
}

test("visible refreshes are staggered and repeated focus events cannot flood the catalog", async () => {
  const h = harness();
  await h.sync.start();
  for (let i = 0; i < 20; i++) await h.sync.resume();
  assert.equal(h.calls(), 1);
  assert.equal(h.timers.size, 1);
  assert.equal([...h.timers][0].delay, 67500);
  await h.tick();
  assert.equal(h.calls(), 2);
  h.sync.stop();
});

test("hidden and offline tabs make no requests and resume when active", async () => {
  const h = harness();
  h.setActive(false); await h.sync.start();
  assert.equal(h.calls(), 0); assert.equal(h.timers.size, 0);
  h.setActive(true); await h.sync.resume();
  assert.equal(h.calls(), 1);
  h.setActive(false); h.sync.pause();
  assert.equal(h.timers.size, 0);
  h.setTime(20000); h.setActive(true); await h.sync.resume();
  assert.equal(h.calls(), 2);
  h.sync.stop();
});

test("a realtime change burst produces one read instead of one read per change", async () => {
  const h = harness(); await h.sync.start();
  for (let i = 0; i < 100; i++) h.sync.changed();
  assert.equal(h.calls(), 1); assert.equal(h.timers.size, 1);
  assert.equal([...h.timers][0].delay, 250);
  await h.tick(); assert.equal(h.calls(), 2);
  h.sync.stop();
});

test("changes received during a read produce one follow-up and never overlap reads", async () => {
  let complete;
  const h = harness(() => new Promise(resolve => { complete = resolve; }));
  const first = h.sync.start(); await Promise.resolve();
  h.sync.changed(); h.sync.changed(); void h.sync.resume();
  assert.equal(h.calls(), 1);
  complete(); await first;
  assert.equal([...h.timers][0].delay, 250);
  h.sync.stop(); assert.equal(h.timers.size, 0);
});

test("failed refreshes retry later and disposal prevents timers after an in-flight response", async () => {
  const failed = harness(async () => { throw new Error("offline"); });
  await failed.sync.start(); assert.equal(failed.timers.size, 1); failed.sync.stop();
  let complete;
  const h = harness(() => new Promise(resolve => { complete = resolve; }));
  const first = h.sync.start(); await Promise.resolve(); h.sync.stop(); complete(); await first;
  assert.equal(h.timers.size, 0); await h.sync.resume(); assert.equal(h.calls(), 1);
});
