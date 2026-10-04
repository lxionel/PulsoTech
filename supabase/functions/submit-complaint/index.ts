interface Dependencies {
  env: (name: string) => string | undefined;
  fetch: typeof fetch;
}

function submissionOf(value: unknown): Record<string, string | number | boolean> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Formato inválido.");
  const source = value as Record<string, unknown>;
  const result: Record<string, string | number | boolean> = {};
  const fields = { name: 200, documentType: 20, documentNumber: 30, email: 254, phone: 30, address: 500, product: 500, kind: 20, detail: 3000, request: 2000 };
  for (const [key, limit] of Object.entries(fields)) {
    const field = source[key];
    if (typeof field !== "string" || !field.trim() || field.length > limit || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(field)) throw new Error("Revisa los campos obligatorios.");
    result[key] = field.trim();
  }
  if (!["DNI", "CE", "Pasaporte"].includes(String(result.documentType)) || !/^[a-z0-9-]{6,30}$/i.test(String(result.documentNumber)) || (result.documentType === "DNI" && !/^\d{8}$/.test(String(result.documentNumber)))) throw new Error("Documento inválido.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(result.email)) || !/^[+\d ()-]{6,30}$/.test(String(result.phone)) || !["reclamo", "queja"].includes(String(result.kind))) throw new Error("Revisa el correo, teléfono y tipo de solicitud.");
  if (typeof source.amount !== "number" || !Number.isFinite(source.amount) || source.amount < 0 || source.amount > 1e8 || Math.abs(source.amount * 100 - Math.round(source.amount * 100)) > 0.000001) throw new Error("Importe inválido.");
  if (typeof source.isMinor !== "boolean" || source.confirmed !== true || (source.website !== undefined && source.website !== "")) throw new Error("Confirma los datos de la solicitud.");
  result.amount = source.amount;
  result.isMinor = source.isMinor;
  if (source.isMinor) {
    if (typeof source.guardian !== "string" || !source.guardian.trim() || source.guardian.length > 200) throw new Error("Indica el nombre de tu madre, padre o representante.");
    result.guardian = source.guardian.trim();
  }
  return result;
}

async function limitedJson(request: Request): Promise<unknown> {
  if (!request.body || !request.headers.get("content-type")?.includes("application/json")) throw new Error("Formato inválido.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 24 * 1024) { await reader.cancel(); throw new Error("La solicitud es demasiado extensa."); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

export function createComplaintHandler(deps: Dependencies) {
  return async (request: Request): Promise<Response> => {
    const origin = request.headers.get("origin") || "";
    const origins = (deps.env("COMPLAINT_ALLOWED_ORIGINS") || "").split(",").map((item) => item.trim()).filter(Boolean);
    const headers = { "Access-Control-Allow-Origin": origins.includes(origin) ? origin : "null", "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info", "Access-Control-Allow-Methods": "POST, OPTIONS", "Cache-Control": "no-store", "Vary": "Origin" };
    const reply = (status: number, body: unknown) => Response.json(body, { status, headers });
    if (!origin || !origins.includes(origin)) return reply(403, { error: "Origen no autorizado." });
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (request.method !== "POST") return reply(405, { error: "Método no permitido." });
    const ruc = deps.env("COMPLAINT_PROVIDER_RUC") || "";
    const secret = deps.env("TURNSTILE_SECRET_KEY");
    const url = deps.env("SUPABASE_URL");
    const key = deps.env("SUPABASE_SERVICE_ROLE_KEY");
    if (!/^\d{11}$/.test(ruc) || !secret || !url || !key) return reply(503, { error: "El registro no está habilitado. Contacta con PulsoTech por correo o WhatsApp." });
    try {
      const raw = await limitedJson(request);
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) return reply(400, { error: "Solicitud inválida." });
      const body = raw as Record<string, unknown>;
      const submission = submissionOf(body.submission);
      if (typeof body.captchaToken !== "string" || !body.captchaToken || body.captchaToken.length > 2048) return reply(400, { error: "Completa la verificación de seguridad." });
      const verification = await deps.fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ secret, response: body.captchaToken }), signal: AbortSignal.timeout(10000),
      });
      if (!verification.ok) return reply(503, { error: "No se pudo verificar la solicitud. Intenta de nuevo." });
      const proof = await verification.json();
      if (proof.success !== true || proof.hostname !== new URL(origin).hostname || proof.action !== "complaint") return reply(400, { error: "La verificación caducó o no es válida. Complétala de nuevo." });
      const provider = { name: "Lionel Davor Aguirre Gomero", tradeName: "PulsoTech", address: "Esperanza Baja, Jr. Huáscar, Mz. S, Lt. 18, Chimbote, Perú", email: "lioneldavor26@gmail.com", ruc };
      const saved = await deps.fetch(`${url}/rest/v1/complaints?select=id,reference,created_at`, {
        method: "POST", headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}`, Prefer: "return=representation" }, body: JSON.stringify({ provider, submission }), signal: AbortSignal.timeout(15000),
      });
      if (!saved.ok) return reply(503, { error: "No pudimos confirmar el registro. Conserva tu solicitud y contacta con PulsoTech antes de reenviarla." });
      const rows = await saved.json();
      if (!Array.isArray(rows) || !rows[0]?.id || !rows[0]?.reference || !rows[0]?.created_at) return reply(503, { error: "No pudimos confirmar el registro. Contacta con PulsoTech." });
      return reply(201, { id: rows[0].id, reference: `PT-${String(rows[0].reference).padStart(6, "0")}`, createdAt: rows[0].created_at, provider, submission });
    } catch (failure) {
      return reply(failure instanceof SyntaxError || (failure instanceof Error && /inválido|Revisa|Indica|Confirma|extensa/.test(failure.message)) ? 400 : 503, { error: "No se pudo completar el registro. Revisa tus datos y, si ya lo enviaste, contacta con PulsoTech antes de intentarlo otra vez." });
    }
  };
}

// La clave privada solo se obtiene del entorno de la función, nunca del navegador.
if (typeof Deno !== "undefined") Deno.serve(createComplaintHandler({ env: (name) => Deno.env.get(name), fetch }));
