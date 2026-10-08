"use client";

import React, { useRef, useState } from "react";
import { Upload, Trash2, ChevronLeft, ChevronRight, ImagePlus } from "lucide-react";
import { validateImageFile } from "@/lib/content-security";
import { MAX_GALLERY_IMAGES, moveImage, uniqueImages } from "@/lib/product-media";
import { getAssetUrl } from "@/utils/paths";

function ImagePreview({ image, alt }: { image: string; alt: string }) {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const lowResolution = size && Math.max(size.width, size.height) < 800;
  return <>
    <img src={getAssetUrl(image)} alt={alt} className="h-20 w-full object-contain"
      onLoad={(event) => setSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} />
    {size && <p className={`mt-1 text-[10px] leading-4 tabular-nums ${lowResolution ? "text-amber-700" : "text-neutral-400"}`}>{size.width} × {size.height} px{lowResolution ? " · Baja resolución" : ""}</p>}
  </>;
}

export default function AdminImageGallery({ title, hint, images, onChange, disabled = false, onBusyChange }: {
  title: string; hint: string; images: string[]; onChange: (images: string[]) => void;
  disabled?: boolean; onBusyChange: (busy: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const uploading = useRef(false);
  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length || uploading.current || disabled) return;
    uploading.current = true;
    setBusy(true); onBusyChange(true); setError("");
    try {
      if (images.length + files.length > MAX_GALLERY_IMAGES) throw new Error(`Puedes añadir hasta ${MAX_GALLERY_IMAGES} fotos por galería.`);
      await Promise.all(files.map((file) => validateImageFile(file)));
      const additions = await Promise.all(files.map((file) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("No se pudo leer la imagen."));
        reader.onerror = () => reject(new Error(`No se pudo leer ${file.name}. Intenta de nuevo.`));
        reader.onabort = () => reject(new Error("La carga se interrumpió."));
        reader.readAsDataURL(file);
      })));
      onChange(uniqueImages([...images, ...additions]));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "No se pudieron cargar las fotos.");
    } finally {
      uploading.current = false; setBusy(false); onBusyChange(false);
    }
  };
  const locked = disabled || busy;
  return <section aria-label={title} className="space-y-3">
    <div><p className="text-xs font-bold text-neutral-900">{title} <span className="font-normal text-neutral-500">· {images.length}/{MAX_GALLERY_IMAGES}</span></p>
      <p className="mt-1 text-[11px] leading-relaxed text-neutral-500">{hint}</p></div>
    {images.length > 0 ? <div className="grid grid-cols-2 min-[420px]:grid-cols-3 sm:grid-cols-4 gap-2">
      {images.map((image, index) => <div key={image} className="rounded-xl border border-neutral-200 bg-white p-2 min-w-0">
        <ImagePreview image={image} alt={`${title}, foto ${index + 1}`} />
        <div className="mt-2 flex items-center justify-between gap-1">
          <span className="text-[10px] font-semibold text-neutral-500">{index === 0 ? "Principal" : `Foto ${index + 1}`}</span>
          <button type="button" disabled={locked} aria-label={`Eliminar foto ${index + 1} de ${title}`} onClick={() => onChange(images.filter((_, i) => i !== index))} className="p-1.5 rounded-lg text-neutral-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
        <div className="flex items-center justify-between gap-1 mt-1">
          <button type="button" disabled={locked || index === 0} aria-label={`Mover foto ${index + 1} antes`} onClick={() => onChange(moveImage(images, index, index - 1))} className="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-25"><ChevronLeft className="w-3.5 h-3.5" /></button>
          <button type="button" disabled={locked || index === 0} onClick={() => onChange(moveImage(images, index, 0))} className="text-[10px] font-semibold disabled:opacity-30">Principal</button>
          <button type="button" disabled={locked || index === images.length - 1} aria-label={`Mover foto ${index + 1} después`} onClick={() => onChange(moveImage(images, index, index + 1))} className="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-25"><ChevronRight className="w-3.5 h-3.5" /></button>
        </div>
      </div>)}
    </div> : <div className="flex items-center gap-2 rounded-xl border border-dashed border-neutral-300 px-3 py-4 text-xs text-neutral-400"><ImagePlus className="w-5 h-5" />Sin fotos todavía</div>}
    <label className={`inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold ${locked ? "opacity-50" : "cursor-pointer hover:border-neutral-900"}`}>
      <Upload className="w-4 h-4" />{busy ? "Cargando fotos…" : "Añadir fotos"}
      <input aria-label={`Añadir fotos a ${title}`} type="file" multiple disabled={locked} accept="image/jpeg,image/png,image/webp,image/gif" onChange={upload} className="sr-only" />
    </label>
    <p className="text-[11px] text-neutral-500">Hasta 2 MB por foto. Para una imagen nítida, usa el archivo original de 1200 px o más.</p>
    {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
  </section>;
}
