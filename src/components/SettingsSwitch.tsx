"use client";

export default function SettingsSwitch({ id, label, checked, disabled = false, onChange }: { id: string; label: string; checked: boolean; disabled?: boolean; onChange: (checked: boolean) => void }) {
  return <button id={id} type="button" role="switch" aria-label={label} aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)} className="flex h-11 w-12 shrink-0 items-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-40">
    <span aria-hidden="true" className={`relative block h-7 w-12 rounded-full transition-colors ${checked ? "bg-black" : "bg-neutral-300"}`}><span className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} /></span>
  </button>;
}
