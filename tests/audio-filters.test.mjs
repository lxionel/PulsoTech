import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_AUDIO_FILTERS, matchesAudioFilters, parsePlaybackHours } from "../src/lib/audio-filters.ts";

test("unfiltered audio includes products with unspecified characteristics", () => {
  assert.equal(matchesAudioFilters({ specs: {} }, DEFAULT_AUDIO_FILTERS), true);
});

test("in-ear and headband filters use the recorded type", () => {
  assert.equal(matchesAudioFilters({ specs: { audioType: "earbuds" } }, { ...DEFAULT_AUDIO_FILTERS, type: "earbuds" }), true);
  assert.equal(matchesAudioFilters({ specs: { audioType: "headband" } }, { ...DEFAULT_AUDIO_FILTERS, type: "earbuds" }), false);
  assert.equal(matchesAudioFilters({ specs: {} }, { ...DEFAULT_AUDIO_FILTERS, type: "headband" }), false);
});

test("unknown ANC and microphone ENC are not classified as with or without ANC", () => {
  for (const specs of [{}, { anc: "Reducción de ruido del micrófono (ENC)" }, { anc: "Estándar" }]) {
    assert.equal(matchesAudioFilters({ specs }, { ...DEFAULT_AUDIO_FILTERS, anc: "yes" }), false);
    assert.equal(matchesAudioFilters({ specs }, { ...DEFAULT_AUDIO_FILTERS, anc: "no" }), false);
  }
  assert.equal(matchesAudioFilters({ specs: { ancEnabled: "yes" } }, { ...DEFAULT_AUDIO_FILTERS, anc: "yes" }), true);
  assert.equal(matchesAudioFilters({ specs: { ancEnabled: "no" } }, { ...DEFAULT_AUDIO_FILTERS, anc: "no" }), true);
});

test("playback thresholds include the boundary and never use case battery or old defaults", () => {
  const filters = { ...DEFAULT_AUDIO_FILTERS, playback: "6" };
  assert.equal(matchesAudioFilters({ specs: { playbackHours: "6" } }, filters), true);
  assert.equal(matchesAudioFilters({ specs: { playbackHours: "5.9" } }, filters), false);
  assert.equal(matchesAudioFilters({ specs: { battery: "Hasta 30h" } }, filters), false);
  assert.equal(matchesAudioFilters({ specs: { battery: "30 h con estuche", playbackHours: "5" } }, filters), false);
});

test("multiple audio characteristics must all match", () => {
  const product = { specs: { audioType: "headband", ancEnabled: "yes", playbackHours: "40" } };
  const filters = { type: "headband", anc: "yes", playback: "40" };
  assert.equal(matchesAudioFilters(product, filters), true);
  assert.equal(matchesAudioFilters(product, { ...filters, type: "earbuds" }), false);
  assert.equal(matchesAudioFilters(product, { ...filters, anc: "no" }), false);
});

test("playback accepts decimal hours and rejects empty, zero or ambiguous values", () => {
  assert.equal(parsePlaybackHours(" 6,5 "), 6.5);
  assert.equal(parsePlaybackHours("10.5"), 10.5);
  for (const value of [undefined, "", "0", "-2", "Infinity", "NaN", "6 h / 30 h con estuche", "1e2"]) {
    assert.equal(parsePlaybackHours(value), undefined);
  }
});
