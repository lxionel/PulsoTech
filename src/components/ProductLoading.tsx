import { LoaderCircle, PackageOpen } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function ProductLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111113]">
      <Navbar />
      <main aria-busy="true" aria-label="Ficha del producto" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-7">
        <div aria-hidden="true" className="flex items-center gap-3 mb-4 sm:mb-5 py-1.5">
          <div className="product-skeleton h-3 w-20 rounded-full" />
          <div className="h-1 w-1 rounded-full bg-neutral-300" />
          <div className="product-skeleton h-3 w-32 rounded-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-6 sm:gap-8 lg:gap-12 items-start">
          <div className="min-w-0 grid gap-3 lg:grid-cols-[64px_minmax(0,1fr)] lg:gap-4">
            <div className="relative aspect-[6/5] sm:aspect-[4/3] lg:aspect-square overflow-hidden bg-neutral-50 flex items-center justify-center lg:col-start-2 lg:row-start-1">
              <div aria-hidden="true" className="absolute inset-5 sm:inset-8 rounded-2xl bg-linear-to-br from-neutral-50 via-white to-neutral-100/80" />
              <div className="relative flex flex-col items-center px-6 text-center">
                <div aria-hidden="true" className="mb-6 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl border border-neutral-200/70 bg-white shadow-[0_12px_30px_-15px_rgba(0,0,0,0.18)]">
                  <PackageOpen className="h-9 w-9 sm:h-11 sm:w-11 text-neutral-400" strokeWidth={1.25} />
                </div>
                <div role="status" className="flex items-center gap-2.5 text-sm font-semibold text-neutral-800">
                  <LoaderCircle aria-hidden="true" className="h-4 w-4 text-emerald-700 motion-safe:animate-spin" />
                  <span>Cargando tu producto</span>
                </div>
                <p className="mt-2 text-xs text-neutral-500">Preparando fotos y detalles…</p>
              </div>
            </div>
            <div aria-hidden="true" className="flex gap-2 lg:flex-col lg:col-start-1 lg:row-start-1">
              {[0, 1, 2].map((item) => <div key={item} className="product-skeleton h-14 w-14 sm:h-16 sm:w-16 rounded-md border border-neutral-200/60" />)}
            </div>
          </div>
          <div aria-hidden="true" className="min-w-0 space-y-5 sm:space-y-6">
            <div className="space-y-4">
              <div className="product-skeleton h-5 w-20 rounded-md" />
              <div className="product-skeleton h-7 sm:h-9 w-4/5 rounded-lg" />
              <div className="product-skeleton h-7 sm:h-9 w-3/5 rounded-lg" />
              <div className="product-skeleton h-3 w-2/3 rounded-full" />
            </div>
            <div className="space-y-3">
              <div className="product-skeleton h-3 w-24 rounded-full" />
              <div className="flex gap-2">
                {[0, 1].map((item) => <div key={item} className="product-skeleton h-16 w-16 rounded-md" />)}
              </div>
            </div>
            <div className="product-skeleton h-10 w-36 rounded-md" />
            <div className="space-y-3">
              <div className="product-skeleton h-12 w-full rounded-md" />
              <div className="product-skeleton h-12 w-full rounded-md" />
              <div className="product-skeleton h-3 w-40 rounded-full" />
              <div className="product-skeleton h-20 w-full rounded-md" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
