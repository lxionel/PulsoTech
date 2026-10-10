"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { getAssetUrl } from "@/utils/paths";

export default function ProductImageViewer({ images, index, title, onIndexChange, onClose }: {
  images: string[]; index: number; title: string;
  onIndexChange: (index: number) => void; onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [bounds, setBounds] = useState({ width: 0, height: 0 });
  useBodyScrollLock(true);
  const move = (direction: number) => { setZoom(false); onIndexChange((index + direction + images.length) % images.length); };

  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    element?.showModal();
    const observer = new ResizeObserver(([entry]) => setBounds({ width: entry.contentRect.width, height: entry.contentRect.height }));
    if (stage.current) observer.observe(stage.current);
    return () => {
      observer.disconnect();
      element?.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  const fit = size.width && bounds.width ? Math.min(1, (bounds.width - 32) / size.width, (bounds.height - 32) / size.height) : 1;
  const scale = fit * (zoom ? 2 : 1);

  return <dialog ref={dialog} aria-labelledby="image-viewer-title" onCancel={(event) => { event.preventDefault(); onClose(); }}
    onKeyDown={(event) => {
      if (event.key === "ArrowRight" && !zoom) { event.preventDefault(); move(1); }
      if (event.key === "ArrowLeft" && !zoom) { event.preventDefault(); move(-1); }
    }}
    className="fixed inset-0 m-0 h-dvh w-screen max-h-none max-w-none border-0 p-0 bg-white text-neutral-950 open:flex flex-col backdrop:bg-white">
    <header className="shrink-0 border-b border-neutral-200 px-4 sm:px-8 py-3 flex items-center gap-3">
      <h2 id="image-viewer-title" className="flex-1 min-w-0 truncate text-sm font-semibold">{title}</h2>
      <button type="button" onClick={() => setZoom(!zoom)} aria-label={zoom ? "Reducir imagen" : "Ampliar imagen"} aria-pressed={zoom} className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-neutral-100">{zoom ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}</button>
      <button type="button" onClick={onClose} autoFocus aria-label="Cerrar fotos" className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-neutral-100"><X className="w-5 h-5" /></button>
    </header>
    <div className="relative flex-1 min-h-0">
      <div ref={stage} className="absolute inset-0 overflow-auto overscroll-contain" style={{ touchAction: zoom ? "auto" : "pan-y" }}
        onTouchStart={(event) => { if (!zoom && event.touches.length === 1) swipeStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; else swipeStart.current = null; }}
        onTouchEnd={(event) => {
          const start = swipeStart.current; swipeStart.current = null;
          if (!start || zoom || !event.changedTouches.length) return;
          const dx = event.changedTouches[0].clientX - start.x;
          const dy = event.changedTouches[0].clientY - start.y;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
        }}>
        <div className="flex items-center justify-center min-w-full min-h-full w-max p-4">
          <img key={images[index]} src={getAssetUrl(images[index])} alt={`${title}, foto ${index + 1}`} draggable={false}
            onLoad={(event) => setSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
            style={size.width ? { width: size.width * scale, height: size.height * scale } : { maxWidth: "100%", maxHeight: "70dvh" }}
            className="block shrink-0 object-contain" />
        </div>
      </div>
      {!zoom && images.length > 1 && <>
        <button type="button" onClick={() => move(-1)} aria-label="Foto anterior ampliada" className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-neutral-200 bg-white/95 flex items-center justify-center"><ChevronLeft className="w-5 h-5" /></button>
        <button type="button" onClick={() => move(1)} aria-label="Siguiente foto ampliada" className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-neutral-200 bg-white/95 flex items-center justify-center"><ChevronRight className="w-5 h-5" /></button>
      </>}
    </div>
    <footer className="shrink-0 border-t border-neutral-200 px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
      <div className="flex gap-2 overflow-x-auto mx-auto w-fit max-w-full">
        {images.map((source, photo) => <button type="button" key={source} aria-label={`Ampliar foto ${photo + 1}`} aria-pressed={photo === index}
          onClick={() => { setZoom(false); onIndexChange(photo); }} className={`w-14 h-14 shrink-0 rounded border p-1 ${photo === index ? "border-black ring-1 ring-black" : "border-neutral-200"}`}><img src={getAssetUrl(source)} alt="" className="w-full h-full object-contain" /></button>)}
      </div>
      <p aria-live="polite" className="text-center text-xs text-neutral-500 mt-2">{index + 1} / {images.length}</p>
    </footer>
  </dialog>;
}
