import type { SupabaseClient } from "@supabase/supabase-js";

export interface CaptchaProof { token: string; issuedAt: number }
export interface AdminCaptchaConfig { siteKey: string; required: boolean; error: string }
const TEST_SITE_KEYS = new Set([
  "1x00000000000000000000AA", "2x00000000000000000000AB", "1x00000000000000000000BB",
  "2x00000000000000000000BB", "3x00000000000000000000FF",
]);

export function adminCaptchaConfig(siteKey = "", required = false, production = false): AdminCaptchaConfig {
  const clean = siteKey.trim();
  const enabled = required || Boolean(clean);
  const error = enabled && !clean ? "Falta configurar la clave pública del CAPTCHA."
    : clean && !/^[a-zA-Z0-9_-]{20,100}$/.test(clean) ? "La clave pública del CAPTCHA no tiene un formato válido."
      : production && TEST_SITE_KEYS.has(clean) ? "Las claves CAPTCHA de prueba no se pueden usar en producción." : "";
  return { siteKey: clean, required: enabled, error };
}

export function getAdminCaptchaConfig(): AdminCaptchaConfig {
  return adminCaptchaConfig(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    process.env.NEXT_PUBLIC_REQUIRE_ADMIN_CAPTCHA === "true", process.env.NODE_ENV === "production");
}

function captchaToken(config: AdminCaptchaConfig, proof: CaptchaProof | null, now: number): string | undefined {
  if (config.error) throw new Error(config.error);
  if (!config.required) return undefined;
  // El token dura 5 minutos. Evitar enviarlo al borde de la expiración; Supabase lo valida en servidor.
  if (!proof?.token || !Number.isFinite(proof.issuedAt) || now < proof.issuedAt || now - proof.issuedAt >= 240000) {
    throw new Error("Completa de nuevo la verificación de seguridad antes de continuar.");
  }
  return proof.token;
}

export async function signInAdmin(client: Pick<SupabaseClient, "auth">, email: string, password: string,
  config: AdminCaptchaConfig, proof: CaptchaProof | null, now = Date.now()) {
  const token = captchaToken(config, proof, now);
  return client.auth.signInWithPassword({ email: email.trim(), password, ...(token ? { options: { captchaToken: token } } : {}) });
}

export async function requestAdminRecovery(client: Pick<SupabaseClient, "auth">, email: string, redirectTo: string,
  config: AdminCaptchaConfig, proof: CaptchaProof | null, now = Date.now()) {
  const token = captchaToken(config, proof, now);
  return client.auth.resetPasswordForEmail(email.trim(), { redirectTo, ...(token ? { captchaToken: token } : {}) });
}

export function authRetrySeconds(error: { status?: number; code?: string } | null): number {
  return error && (error.status === 429 || error.code === "over_request_rate_limit" || error.code === "over_email_send_rate_limit") ? 60 : 0;
}
