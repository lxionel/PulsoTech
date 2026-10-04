"use client";
import { useEffect } from "react";
import { lockBodyScroll } from "@/lib/body-scroll-lock";

export function useBodyScrollLock(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;
    return lockBodyScroll(document.body);
  }, [isOpen]);
}
