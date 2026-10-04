import type { Product } from "@/types";

export interface AudioFilters {
  type: "all" | "earbuds" | "headband";
  anc: "all" | "yes" | "no";
  playback: "all" | "6" | "10" | "20" | "40";
}

export const DEFAULT_AUDIO_FILTERS: AudioFilters = { type: "all", anc: "all", playback: "all" };

export const AUDIO_TYPE_OPTIONS = [
  { value: "all", label: "Todos los tipos" },
  { value: "earbuds", label: "In-ear / earbuds" },
  { value: "headband", label: "De diadema" },
] as const;

export const AUDIO_ANC_OPTIONS = [
  { value: "all", label: "Con y sin ANC" },
  { value: "yes", label: "Con ANC" },
  { value: "no", label: "Sin ANC" },
] as const;

export const AUDIO_PLAYBACK_OPTIONS = [
  { value: "all", label: "Cualquier autonomía" },
  { value: "6", label: "6 horas o más" },
  { value: "10", label: "10 horas o más" },
  { value: "20", label: "20 horas o más" },
  { value: "40", label: "40 horas o más" },
] as const;

export function parsePlaybackHours(value: string | undefined): number | undefined {
  const normalized = value?.trim().replace(",", ".");
  if (!normalized || !/^\d+(?:\.\d+)?$/.test(normalized)) return undefined;
  const hours = Number(normalized);
  return Number.isFinite(hours) && hours > 0 ? hours : undefined;
}

// Explicit attributes avoid mistaking microphone ENC for ANC or case battery for playback.
export function matchesAudioFilters(product: Pick<Product, "specs">, filters: AudioFilters): boolean {
  const specs = product.specs || {};
  if (filters.type !== "all" && specs.audioType !== filters.type) return false;
  if (filters.anc !== "all" && specs.ancEnabled !== filters.anc) return false;
  if (filters.playback !== "all") {
    const hours = parsePlaybackHours(specs.playbackHours);
    if (hours === undefined || hours < Number(filters.playback)) return false;
  }
  return true;
}
