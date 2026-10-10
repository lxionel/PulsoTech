import type { SaleRecord } from "@/types";

export interface PrivateSalesState {
  records: SaleRecord[];
  loading: boolean;
  saving: boolean;
  ready: boolean;
  error: string;
}

export const INITIAL_SALES_STATE: PrivateSalesState = {
  records: [], loading: true, saving: false, ready: false, error: "",
};

export type SaleCommand =
  | { kind: "create"; sale: SaleRecord; productId: string | null; expectedPrice: number | null }
  | { kind: "status"; id: string; status: NonNullable<SaleRecord["deliveryStatus"]> }
  | { kind: "remove"; id: string }
  | { kind: "clear" };

export interface SaleCommandSuccess {
  ok: true;
  records: SaleRecord[];
  sale?: SaleRecord;
  stock?: { id: string; stockCount: number; inStock: boolean; updatedAt?: string; colorStocks?: { name: string; stockCount: number }[] } | null;
}
export type SaleCommandResult = SaleCommandSuccess | { ok: false; message: string; uncertain: boolean };

/** Historical records remain visible; valid IDs are never treated as demo data. */
export function normalizeSalesRecords(value: unknown): SaleRecord[] {
  if (!Array.isArray(value) || value.length > 10000) throw new Error("Historial inválido.");
  return value.map((item: SaleRecord) => {
    if (!item || typeof item !== "object" || typeof item.id !== "string" || !item.id ||
      typeof item.productName !== "string" || typeof item.customerName !== "string" ||
      typeof item.date !== "string" || !Number.isSafeInteger(item.quantity) || item.quantity <= 0 ||
      !Number.isFinite(item.total) || item.total < 0 ||
      (item.channel !== undefined && !["WhatsApp", "Presencial", "Web"].includes(item.channel)) ||
      (item.deliveryStatus !== undefined && !["pending", "prepared", "shipped", "delivered", "cancelled"].includes(item.deliveryStatus)) ||
      ["paymentMethod", "notes", "customerPhone", "customerAddress", "trackingNumber", "selectedColor"].some((key) => {
        const field = item[key as keyof SaleRecord];
        return field !== undefined && typeof field !== "string";
      })) throw new Error("Historial inválido.");
    const timestamp = Number.isFinite(item.timestamp) ? item.timestamp : Date.parse(item.date);
    if (!Number.isFinite(timestamp) || Math.abs(timestamp) > 8.64e15) throw new Error("Fecha inválida.");
    return { ...item, timestamp, channel: item.channel || "WhatsApp" };
  });
}

/** No Storage dependency: private records live only in this authorized panel's memory. */
export function createPrivateSalesStore(dependencies: {
  read: () => Promise<SaleRecord[] | null>;
  mutate: (command: SaleCommand) => Promise<SaleCommandResult>;
}) {
  let state = INITIAL_SALES_STATE;
  let disposed = false;
  let revision = 0;
  const listeners = new Set<(state: PrivateSalesState) => void>();
  const publish = (change: Partial<PrivateSalesState>) => {
    if (disposed) return;
    state = { ...state, ...change };
    listeners.forEach((listener) => listener(state));
  };

  return {
    getState: () => state,
    subscribe(listener: (state: PrivateSalesState) => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    async load() {
      if (disposed || state.saving) return false;
      const current = ++revision;
      publish({ loading: true, ready: false, error: "" });
      try {
        const result = await dependencies.read();
        if (disposed || current !== revision) return false;
        if (result === null) throw new Error("Lectura no confirmada.");
        const records = normalizeSalesRecords(result);
        publish({ records, loading: false, ready: true });
        return true;
      } catch {
        if (!disposed && current === revision) publish({ loading: false, ready: false,
          error: "No pudimos cargar el historial de ventas. Reintenta antes de registrar o modificar una orden." });
        return false;
      }
    },
    async execute(command: SaleCommand): Promise<SaleCommandSuccess | null> {
      if (disposed || state.loading || state.saving || !state.ready) return null;
      try { if (command.kind === "create") normalizeSalesRecords([command.sale]); }
      catch {
        publish({ error: "Revisa los datos de la venta: cantidad, importe y fecha deben ser válidos." });
        return null;
      }
      publish({ saving: true, error: "" });
      try {
        const result = await dependencies.mutate(command);
        if (disposed) return null;
        if (!result.ok) {
          publish({ saving: false, ready: !result.uncertain, error: result.message });
          return null;
        }
        const records = normalizeSalesRecords(result.records);
        publish({ records, saving: false });
        return { ...result, records };
      } catch {
        // A network failure may follow a successful server write. Require a fresh read
        // before any retry so the same order is not submitted blindly a second time.
        publish({ saving: false, ready: false,
          error: "No pudimos confirmar el guardado. Recarga el historial y comprueba la orden antes de volver a registrarla." });
        return null;
      }
    },
    dispose() {
      disposed = true;
      revision++;
      state = { ...INITIAL_SALES_STATE, records: [] };
      listeners.clear();
    },
  };
}
