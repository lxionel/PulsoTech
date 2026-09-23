"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sliders, Volume2, VolumeX, Play, Pause, Waves, ShieldCheck } from "lucide-react";

interface EnvironmentScenario {
  id: string;
  name: string;
  icon: string;
  description: string;
  baseDb: number;
}

const SCENARIOS: EnvironmentScenario[] = [
  {
    id: "metro",
    name: "Metro y Tráfico",
    icon: "🚇",
    description: "Vibraciones y rumor urbano continuo en transporte público.",
    baseDb: 82,
  },
  {
    id: "avion",
    name: "Cabina de Avión",
    icon: "✈️",
    description: "Zumbido monótono de motores a reacción en vuelos de larga distancia.",
    baseDb: 78,
  },
  {
    id: "cafe",
    name: "Cafetería & Murmullo",
    icon: "☕",
    description: "Conversaciones, tintineo de tazas y ambiente ruidoso de trabajo.",
    baseDb: 68,
  },
];

export default function SoundSimulator() {
  const [selectedScenario, setSelectedScenario] = useState<EnvironmentScenario>(SCENARIOS[0]);
  const [isAncActive, setIsAncActive] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [soundProfile, setSoundProfile] = useState<"balanced" | "bass" | "vocal">("balanced");

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const biquadFilterRef = useRef<BiquadFilterNode | null>(null);

  const togglePlayAudio = () => {
    if (isPlayingAudio) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setIsPlayingAudio(false);
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.12;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = isAncActive ? 140 : 1100;
      biquadFilterRef.current = filter;

      const gain = ctx.createGain();
      gain.gain.value = isAncActive ? 0.02 : 0.15;
      gainNodeRef.current = gain;

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noiseSource.start();
      setIsPlayingAudio(true);
    } catch {
      setIsPlayingAudio(false);
    }
  };

  useEffect(() => {
    if (audioCtxRef.current && gainNodeRef.current && biquadFilterRef.current) {
      const targetGain = isAncActive ? 0.02 : 0.15;
      const targetFreq = isAncActive ? 140 : 1100;
      gainNodeRef.current.gain.setTargetAtTime(targetGain, audioCtxRef.current.currentTime, 0.2);
      biquadFilterRef.current.frequency.setTargetAtTime(targetFreq, audioCtxRef.current.currentTime, 0.2);
    }
  }, [isAncActive]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const currentDb = isAncActive ? Math.max(30, selectedScenario.baseDb - 45) : selectedScenario.baseDb;

  return (
    <section id="simulador" className="py-20 bg-[#f5f5f7] border-y border-neutral-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-neutral-300 text-[11px] font-mono uppercase tracking-wider text-neutral-700 shadow-xs">
            <Sliders className="w-3.5 h-3.5 text-neutral-900" />
            <span>Laboratorio Acústico Pulso</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
            ¿Cómo funciona la Cancelación Activa?
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Nuestros audífonos escuchan el ruido ambiental con 6 micrófonos de alta precisión y crean una onda opuesta instantánea para anularlo antes de que alcance tu tímpano.
          </p>
        </div>

        {/* Simulator Card (Apple-style clean white) */}
        <div className="rounded-3xl bg-white border border-neutral-200 p-6 sm:p-10 shadow-sm space-y-8">
          {/* Step 1: Environments */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block font-mono">
              1. Selecciona un entorno ruidoso:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SCENARIOS.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => setSelectedScenario(scenario)}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                    selectedScenario.id === scenario.id
                      ? "border-black bg-neutral-50 ring-1 ring-black shadow-xs"
                      : "border-neutral-200 bg-white hover:border-neutral-300"
                  }`}
                >
                  <span className="text-2xl p-1 bg-neutral-100 rounded-lg">{scenario.icon}</span>
                  <div>
                    <div className="text-sm font-bold text-neutral-900">{scenario.name}</div>
                    <div className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{scenario.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Main interactive decibel & ANC control */}
          <div className="rounded-2xl border border-neutral-200 bg-[#fbfbfd] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Decibel Counter */}
            <div className="flex flex-col items-center md:items-start space-y-1 text-center md:text-left">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                Presión Sonora en el Oído
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-extrabold font-mono text-neutral-900 tracking-tight transition-all duration-300">
                  {currentDb}
                </span>
                <span className="text-lg font-mono text-neutral-500 font-semibold">dB</span>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-white border border-neutral-200 shadow-xs">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isAncActive ? "bg-emerald-600 animate-pulse" : "bg-neutral-400"
                  }`}
                />
                <span className={isAncActive ? "text-emerald-800" : "text-neutral-600"}>
                  {isAncActive ? "Silencio Inmersivo Activo (-45dB)" : "Ruido Exterior Filtrándose"}
                </span>
              </div>
            </div>

            {/* Big ANC Switch Button */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => setIsAncActive(!isAncActive)}
                className={`px-8 py-4 rounded-full font-bold text-xs tracking-wider uppercase transition-all shadow-sm flex items-center gap-2.5 active:scale-95 ${
                  isAncActive
                    ? "bg-black text-white hover:bg-neutral-800"
                    : "bg-neutral-200 text-neutral-800 hover:bg-neutral-300 border border-neutral-300"
                }`}
              >
                {isAncActive ? (
                  <>
                    <VolumeX className="w-4 h-4 text-white" />
                    <span>ANC ACTIVADO (45dB)</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-neutral-700" />
                    <span>ACTIVAR CANCELACIÓN</span>
                  </>
                )}
              </button>
              <span className="text-[11px] text-neutral-400 font-mono">
                {isAncActive ? "Toca para apagar" : "Toca para experimentar el aislamiento"}
              </span>
            </div>

            {/* Audio Web API Test */}
            <div className="flex flex-col items-center md:items-end gap-1.5">
              <button
                onClick={togglePlayAudio}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-neutral-300 bg-white hover:bg-neutral-100 text-xs font-semibold text-neutral-800 shadow-xs transition-colors"
              >
                {isPlayingAudio ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-neutral-900" />
                    <span>Pausar Sonido Real</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                    <span>Escuchar Audio Demo</span>
                  </>
                )}
              </button>
              <span className="text-[10px] text-neutral-500 text-center md:text-right max-w-[160px]">
                Usa audífonos para notar la atenuación
              </span>
            </div>
          </div>

          {/* Minimalist Soundwave Bars (Clean monochrome) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
              <span>GRAVES (20Hz - 250Hz)</span>
              <span>MEDIOS Y AGUDOS (1kHz - 20kHz)</span>
            </div>
            <div className="h-16 w-full bg-[#f5f5f7] rounded-2xl border border-neutral-200 p-3 flex items-center justify-between gap-1 overflow-hidden">
              {Array.from({ length: 32 }).map((_, index) => {
                const heightPercentage = isAncActive
                  ? Math.max(12, Math.sin(index * 0.4) * 12 + 10)
                  : Math.max(25, Math.sin(index * 0.5) * 65 + 30);

                return (
                  <div key={index} className="flex-1 flex items-center justify-center h-full">
                    <div
                      className={`w-full rounded-full transition-all duration-300 ${
                        isAncActive ? "bg-emerald-600/70" : "bg-neutral-900"
                      }`}
                      style={{
                        height: `${heightPercentage}%`,
                        opacity: isAncActive ? 0.5 : 0.85,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* EQ Profiles */}
          <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
              <Waves className="w-4 h-4 text-neutral-700" />
              <span>PERFILES DE SONIDO ADAPTABLES:</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundProfile("balanced")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  soundProfile === "balanced"
                    ? "bg-black text-white"
                    : "bg-neutral-100 text-neutral-600 hover:text-black"
                }`}
              >
                Hi-Fi Balanceado
              </button>
              <button
                onClick={() => setSoundProfile("bass")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  soundProfile === "bass"
                    ? "bg-black text-white"
                    : "bg-neutral-100 text-neutral-600 hover:text-black"
                }`}
              >
                Bass Boost +
              </button>
              <button
                onClick={() => setSoundProfile("vocal")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  soundProfile === "vocal"
                    ? "bg-black text-white"
                    : "bg-neutral-100 text-neutral-600 hover:text-black"
                }`}
              >
                Voz & Podcasts
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
