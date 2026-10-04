"use client";

import { Check } from "lucide-react";
import type { Product } from "@/types";
import {
  type AudioFilters,
  AUDIO_TYPE_OPTIONS,
  AUDIO_ANC_OPTIONS,
  AUDIO_PLAYBACK_OPTIONS,
  matchesAudioFilters,
} from "@/lib/audio-filters";

interface AudioFiltersPanelProps {
  filters: AudioFilters;
  onChange: (filters: AudioFilters) => void;
  products: Product[];
  className?: string;
}

export default function AudioFiltersPanel({ filters, onChange, products, className = "" }: AudioFiltersPanelProps) {
  const groups = [
    { key: "type", title: "Tipo de audífono", options: AUDIO_TYPE_OPTIONS },
    { key: "anc", title: "Cancelación activa (ANC)", options: AUDIO_ANC_OPTIONS },
    { key: "playback", title: "Autonomía por carga", options: AUDIO_PLAYBACK_OPTIONS },
  ] as const;

  return (
    <div className={`space-y-5 ${className}`}>
      {groups.map((group) => (
        <fieldset key={group.key} className="space-y-2.5">
          <legend className="text-xs font-black text-neutral-950 uppercase tracking-wider mb-2.5">
            {group.title}
          </legend>
          {group.key === "playback" && (
            <p className="text-[11px] text-neutral-500 leading-relaxed">Horas de uso sin contar el estuche.</p>
          )}
          <div className="space-y-1.5">
            {group.options.map((option) => {
              const nextFilters = { ...filters, [group.key]: option.value };
              const count = products.filter((product) => matchesAudioFilters(product, nextFilters)).length;
              const isSelected = filters[group.key] === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={isSelected}
                  disabled={option.value !== "all" && count === 0 && !isSelected}
                  onClick={() => onChange(nextFilters)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${isSelected
                    ? "bg-neutral-950 text-white font-bold"
                    : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950"}`}
                >
                  <span>{option.label}</span>
                  <span className="inline-flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold opacity-75">{count}</span>
                    {isSelected && <Check aria-hidden="true" className="w-3.5 h-3.5" />}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
