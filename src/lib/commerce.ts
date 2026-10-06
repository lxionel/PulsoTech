import type { Product } from '../types/index.ts';

export const STORE_MODE = process.env.NEXT_PUBLIC_STORE_MODE === 'live' ? 'live' : 'preparation';
export type PublicationStatus = 'draft' | 'demo' | 'live';
export interface ProductCommerce { status: PublicationStatus; warranty: string; included: string; delivery: string; verified: boolean; }
export interface CommerceSettings {
  owner: string; ruc: string; address: string; email: string; hours: string;
  deliveryArea: string; deliveryCost: string; deliveryTime: string;
  ordersEnabled: boolean;
}
export const DEFAULT_COMMERCE_SETTINGS: CommerceSettings = {
  owner: '', ruc: '', address: '', email: '', hours: '', deliveryArea: '', deliveryCost: '', deliveryTime: '', ordersEnabled: false,
};
export function parseCommerceSettings(value: unknown): CommerceSettings {
  const result = { ...DEFAULT_COMMERCE_SETTINGS };
  if (!value || typeof value !== 'object' || Array.isArray(value)) return result;
  const source = value as Record<string, unknown>;
  for (const key of ['owner','ruc','address','email','hours','deliveryArea','deliveryCost','deliveryTime'] as const) {
    if (typeof source[key] === 'string') result[key] = source[key].trim().slice(0, key === 'address' ? 500 : 300);
  }
  result.ordersEnabled = source.ordersEnabled === true;
  return result;
}
export function commerceRequirements(config: CommerceSettings): string[] {
  const missing: string[] = [];
  if (!config.owner) missing.push('Responsable o razón social');
  if (!/^\d{11}$/.test(config.ruc)) missing.push('RUC de once dígitos');
  if (!config.address) missing.push('Dirección del negocio');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email)) missing.push('Correo de atención');
  if (!config.hours) missing.push('Horario de atención');
  if (!config.deliveryArea || !config.deliveryCost || !config.deliveryTime) missing.push('Zonas, costo y plazo de entrega');
  return missing;
}
export function productCommerce(product: Pick<Product, 'specs'>): ProductCommerce {
  const specs = product.specs || {};
  return { status: specs.storeStatus === 'live' || specs.storeStatus === 'draft' ? specs.storeStatus : 'demo', warranty: specs.storeWarranty || '', included: specs.storeIncluded || '', delivery: specs.storeDelivery || '', verified: specs.storeVerified === 'true' };
}
export function commerceSpecs(commerce: ProductCommerce): Product['specs'] {
  return { storeStatus: commerce.status, storeWarranty: commerce.warranty.trim(), storeIncluded: commerce.included.trim(), storeDelivery: commerce.delivery.trim(), storeVerified: String(commerce.verified) };
}
export function productRequirements(product: Product): string[] {
  const commerce = productCommerce(product);
  const missing: string[] = [];
  if (!product.name.trim() || !product.brand.trim() || !product.category.trim()) missing.push('Nombre, marca y categoría');
  if (!Number.isFinite(product.price) || product.price <= 0) missing.push('Precio válido');
  if (!product.description.trim()) missing.push('Descripción');
  if (!product.images?.length && !product.colors.some(c => c.image || c.images?.length)) missing.push('Fotografías');
  if (!commerce.warranty.trim()) missing.push('Condiciones de garantía');
  if (!commerce.included.trim()) missing.push('Contenido de la caja');
  if (!commerce.verified) missing.push('Verificación de datos y fotografías');
  return missing;
}
export function isStorefrontProduct(product: Product, mode = STORE_MODE): boolean {
  const status = productCommerce(product).status;
  return mode === 'live' ? status === 'live' && productRequirements(product).length === 0 : status !== 'draft';
}
export function canAcceptOrders(config: CommerceSettings): boolean {
  return STORE_MODE === 'live' && config.ordersEnabled && commerceRequirements(config).length === 0
    && process.env.NEXT_PUBLIC_COMPLAINT_BOOK_ENABLED === 'true'
    && config.ruc === process.env.NEXT_PUBLIC_STORE_RUC?.trim();
}
