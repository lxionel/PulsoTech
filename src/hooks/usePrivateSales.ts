"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPrivateSalesStore, INITIAL_SALES_STATE, type SaleCommand } from "@/lib/private-sales";
import { fetchSalesRecordsFromSupabase, executeSalesCommand } from "@/lib/supabase";

export function usePrivateSales() {
  const [state, setState] = useState(INITIAL_SALES_STATE);
  const storeRef = useRef<ReturnType<typeof createPrivateSalesStore> | null>(null);
  useEffect(() => {
    const store = createPrivateSalesStore({ read: fetchSalesRecordsFromSupabase, mutate: executeSalesCommand });
    storeRef.current = store;
    const unsubscribe = store.subscribe(setState);
    void store.load();
    return () => {
      unsubscribe();
      store.dispose();
      if (storeRef.current === store) storeRef.current = null;
    };
  }, []);
  const reload = useCallback(() => storeRef.current?.load() ?? Promise.resolve(false), []);
  const execute = useCallback((command: SaleCommand) =>
    storeRef.current?.execute(command) ?? Promise.resolve(null), []);
  return { ...state, reload, execute };
}
