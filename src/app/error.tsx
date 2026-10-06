"use client";

import Link from "next/link";

export default function StoreError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="mx-auto flex min-h-[70dvh] max-w-xl flex-col items-center justify-center gap-5 px-6 py-16 text-center"><p className="text-sm font-semibold tracking-wide">PulsoTech</p><h1 className="text-2xl font-semibold tracking-tight">No pudimos mostrar esta página</h1><p className="text-sm leading-6 text-neutral-600">Puedes intentar nuevamente. Tu bolsa se conserva en este navegador.</p><button onClick={reset} className="min-h-12 rounded-lg bg-black px-6 text-sm font-semibold text-white">Intentar nuevamente</button><Link href="/" className="min-h-11 py-3 text-sm underline underline-offset-4">Volver al inicio</Link></main>;
}
