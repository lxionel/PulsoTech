"use client";

import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";

export const AdministratorContext = createContext<{ user: User; logout: () => Promise<void> } | null>(null);

export function useAdministrator() {
  const session = useContext(AdministratorContext);
  if (!session) throw new Error("El panel necesita una sesión de administrador verificada.");
  return session;
}
