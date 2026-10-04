import type { SupabaseClient, User } from "@supabase/supabase-js";

export class AdminAccessError extends Error {
  readonly code: "signed_out" | "forbidden" | "unavailable" | "mfa_required" | "configuration";
  constructor(code: AdminAccessError["code"]) {
    super(code === "forbidden" ? "Esta cuenta no tiene acceso al administrador."
      : code === "signed_out" ? "Inicia sesión para continuar."
        : code === "mfa_required" ? "Completa la verificación en dos pasos para continuar."
          : code === "configuration" ? "Falta activar la protección en dos pasos en Supabase. Ejecuta supabase/activate-mfa.sql."
        : "No pudimos verificar tus permisos. Intenta de nuevo.");
    this.name = "AdminAccessError";
    this.code = code;
  }
}

type AdminClient = Pick<SupabaseClient, "auth" | "rpc">;
export interface AdminMfaFactor { id: string; name: string }
export interface AdminAccessState {
  user: User;
  step: "enroll" | "challenge" | "ready";
  factors: AdminMfaFactor[];
}

// Esta comprobación solo autoriza a configurar/verificar el factor, nunca a leer ventas o escribir.
export async function verifyAdminAccount(client: AdminClient): Promise<User> {
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) throw new AdminAccessError("signed_out");
  const { data: allowed, error: permissionError } = await client.rpc("is_store_admin_account");
  if (permissionError) throw new AdminAccessError(permissionError.code === "PGRST202" || permissionError.code === "42883" ? "configuration" : "unavailable");
  if (allowed !== true) throw new AdminAccessError("forbidden");
  return data.user;
}

export async function resolveAdminAccess(client: AdminClient): Promise<AdminAccessState> {
  const user = await verifyAdminAccount(client);
  // listFactors vuelve a consultar Auth: no confiar en factores guardados en una sesión antigua.
  const { data: listed, error: factorsError } = await client.auth.mfa.listFactors();
  if (factorsError || !listed) throw new AdminAccessError("unavailable");
  const factors = listed.all.filter((factor) => factor.factor_type === "totp" && factor.status === "verified")
    .map((factor) => ({ id: factor.id, name: factor.friendly_name || "Aplicación autenticadora" }));
  if (factors.length === 0) {
    if (listed.all.some((factor) => factor.status === "verified")) throw new AdminAccessError("unavailable");
    return { user, step: "enroll", factors };
  }
  const { data: assurance, error: assuranceError } = await client.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assuranceError || !assurance || !assurance.currentLevel) throw new AdminAccessError("unavailable");
  if (assurance.currentLevel !== "aal2" || assurance.nextLevel !== "aal2") return { user, step: "challenge", factors };
  // La base de datos comprueba el JWT firmado, el rol y la existencia del factor verificado.
  const { data: allowed, error: permissionError } = await client.rpc("is_store_admin");
  if (permissionError) throw new AdminAccessError("unavailable");
  if (allowed !== true) throw new AdminAccessError("forbidden");
  return { user, step: "ready", factors };
}

export async function verifyAdminAccess(client: AdminClient): Promise<User> {
  const state = await resolveAdminAccess(client);
  if (state.step !== "ready") throw new AdminAccessError("mfa_required");
  return state.user;
}

export async function enrollAdminAuthenticator(client: AdminClient) {
  await verifyAdminAccount(client);
  const { data: listed, error: listError } = await client.auth.mfa.listFactors();
  if (listError || !listed) throw new AdminAccessError("unavailable");
  if (listed.all.some((factor) => factor.status === "verified")) throw new AdminAccessError("mfa_required");
  // Limpiar únicamente configuraciones de esta tienda que quedaron sin confirmar.
  for (const factor of listed.all) {
    if (factor.factor_type === "totp" && factor.status === "unverified" && factor.friendly_name === "PulsoTech administrador") {
      const { error } = await client.auth.mfa.unenroll({ factorId: factor.id });
      if (error) throw new AdminAccessError("unavailable");
    }
  }
  const { data, error } = await client.auth.mfa.enroll({ factorType: "totp", issuer: "PulsoTech", friendlyName: "PulsoTech administrador" });
  if (error || !data) throw new AdminAccessError("unavailable");
  return { id: data.id, secret: data.totp.secret, qr: authenticatorQrSource(data.totp.qr_code) };
}

export function authenticatorQrSource(value: string): string {
  const prefix = "data:image/svg+xml;utf-8,";
  if (!value.startsWith(prefix)) throw new AdminAccessError("unavailable");
  // Renderizar como imagen, sin inyectar SVG/HTML ni enviarlo a un generador externo.
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(value.slice(prefix.length))}`;
}

export async function cancelAdminEnrollment(client: AdminClient, factorId: string) {
  await verifyAdminAccount(client);
  const { data, error } = await client.auth.mfa.listFactors();
  if (error || !data) throw new AdminAccessError("unavailable");
  const factor = data.all.find((item) => item.id === factorId);
  if (!factor || factor.status !== "unverified" || factor.factor_type !== "totp" || factor.friendly_name !== "PulsoTech administrador") return;
  const { error: cancelError } = await client.auth.mfa.unenroll({ factorId });
  if (cancelError) throw new AdminAccessError("unavailable");
}

export async function verifyAdminAuthenticator(client: AdminClient, factorId: string, code: string): Promise<void> {
  if (!/^\d{6}$/.test(code) || !factorId) throw new Error("Escribe el código de seis dígitos de tu aplicación.");
  await verifyAdminAccount(client);
  const { error } = await client.auth.mfa.challengeAndVerify({ factorId, code });
  if (error) throw new Error("No pudimos verificar el código. Usa el código actual de la aplicación y comprueba tu conexión.");
  // Completar el challenge no basta si los permisos se revocaron durante la verificación.
  await verifyAdminAccess(client);
}

export function isPublicSupabaseKey(key: string): boolean {
  if (key.startsWith("sb_publishable_")) return key.length > "sb_publishable_".length;
  if (key.startsWith("sb_secret_")) return false;
  try {
    const payload = key.split(".")[1];
    if (!payload || key.split(".").length !== 3) return false;
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded.role === "anon";
  } catch {
    return false;
  }
}
