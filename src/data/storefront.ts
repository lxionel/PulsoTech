import snapshot from "./commerce-build.json";
import { canAcceptOrders, parseCommerceSettings } from "@/lib/commerce";

export const BUILT_COMMERCE_SETTINGS = parseCommerceSettings(snapshot.settings);
// Pausing orders must not remove an established store from search results.
export const STORE_INDEXABLE = snapshot.installed && canAcceptOrders({ ...BUILT_COMMERCE_SETTINGS, ordersEnabled: true });
