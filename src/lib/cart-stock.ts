import type { CartItem, Coupon, Product, ProductColor } from "@/types";
import { hasColorStock, stockForColor } from "./variant-stock.ts";

export function availableStock(product?: Product): number {
  if (!product || product.inStock === false || !Number.isFinite(product.stockCount)) return 0;
  return Math.max(0, Math.floor(product.stockCount));
}

function colorName(item: CartItem): string {
  return item.selectedColor?.name || "Original";
}

export function cartQuantityLimit(items: CartItem[], products: Product[], productId: string, color: string): number {
  const product = products.find((product) => product.id === productId);
  if (product && hasColorStock(product)) return stockForColor(product, color);
  const stock = availableStock(product);
  const otherColors = items.reduce((sum, item) => item.product.id === productId && colorName(item) !== color
    ? sum + item.quantity : sum, 0);
  return Math.max(0, stock - otherColors);
}

export function inspectCart(items: CartItem[], products: Product[]) {
  const liveItems = items.map((item) => {
    const product = products.find((candidate) => candidate.id === item.product.id);
    const color = product?.colors?.find((candidate) => candidate.name === colorName(item));
    return { ...item, product: product || item.product, selectedColor: color || item.selectedColor };
  });
  const issues = new Map<string, string>();
  items.forEach((item) => {
    const product = products.find((candidate) => candidate.id === item.product.id);
    let message = "";
    if (!product) message = "Este producto ya no está disponible. Retíralo de la bolsa.";
    else if (!Number.isFinite(product.price) || product.price <= 0) message = "No pudimos comprobar el precio. Retira el producto o consulta con la tienda.";
    else if (availableStock(product) === 0) message = "Producto agotado. Retíralo para continuar.";
    else if (product.colors?.length && !product.colors.some((color) => color.name === colorName(item))) {
      message = "Este color ya no está disponible. Retíralo y elige otro en la ficha.";
    } else if (!Number.isInteger(item.quantity) || item.quantity < 1) message = "Revisa la cantidad de este producto.";
    else if (hasColorStock(product) && items.filter((line) => line.product.id === product.id && colorName(line) === colorName(item)).reduce((sum, line) => sum + line.quantity, 0) > stockForColor(product, colorName(item))) {
      message = `Quedan ${stockForColor(product, colorName(item))} unidades de ${colorName(item)}. Reduce la cantidad o elige otro color.`;
    }
    else if (items.filter((line) => line.product.id === product.id).reduce((sum, line) => sum + line.quantity, 0) > availableStock(product)) {
      message = `Quedan ${availableStock(product)} unidades en total para este modelo, entre todos los colores. Reduce la cantidad.`;
    }
    if (message) issues.set(`${item.product.id}:${colorName(item)}`, message);
  });
  const pricesChanged = liveItems.some((item, index) => item.product.price !== items[index].product.price);
  return { items: liveItems, issues, pricesChanged };
}

export function addCartItem(items: CartItem[], products: Product[], productId: string, color: ProductColor, quantity: number) {
  const product = products.find((candidate) => candidate.id === productId);
  const stock = availableStock(product);
  if (!product || stock === 0) return { items, notice: "Este producto está agotado o ya no está disponible." };
  if (!Number.isInteger(quantity) || quantity < 1) return { items, notice: "Elige una cantidad entera mayor que cero." };
  if (product.colors?.length && !product.colors.some((candidate) => candidate.name === color.name)) {
    return { items, notice: "El color seleccionado ya no está disponible. Elige otro en la ficha." };
  }
  const used = items.filter((item) => item.product.id === productId && colorName(item) === color.name).reduce((sum, item) => sum + item.quantity, 0);
  const added = Math.min(quantity, Math.max(0, cartQuantityLimit(items, products, productId, color.name) - used));
  if (added === 0) return { items, notice: `Ya tienes todas las unidades disponibles de ${product.name} en tu bolsa.` };
  const liveColor = product.colors?.find((candidate) => candidate.name === color.name) || color;
  const exists = items.some((item) => item.product.id === productId && colorName(item) === color.name);
  const next = exists ? items.map((item) => item.product.id === productId && colorName(item) === color.name
    ? { ...item, product, selectedColor: liveColor, quantity: item.quantity + added } : item)
    : [...items, { product, selectedColor: liveColor, quantity: added }];
  return { items: next, notice: added < quantity ? `Se añadieron ${added} unidades. No hay más stock de este modelo.` : "" };
}

export function setCartQuantity(items: CartItem[], products: Product[], productId: string, color: string, quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 0) return { items, notice: "Elige una cantidad entera válida." };
  if (quantity === 0) return { items: items.filter((item) => !(item.product.id === productId && colorName(item) === color)), notice: "" };
  const limit = cartQuantityLimit(items, products, productId, color);
  if (limit === 0) return { items, notice: "No quedan unidades para aumentar esta cantidad. Retira el producto o reduce otro color." };
  const nextQuantity = Math.min(quantity, limit);
  return {
    items: items.map((item) => item.product.id === productId && colorName(item) === color ? { ...item, quantity: nextQuantity } : item),
    notice: quantity > limit ? `La cantidad se ajustó a ${limit}, según el stock disponible.` : "",
  };
}

export function cartTotals(items: CartItem[], coupon: Coupon | null) {
  const subtotalCents = items.reduce((sum, item) => sum + Math.round(item.product.price * 100) * item.quantity, 0);
  const subtotal = subtotalCents / 100;
  let discountCents = 0;
  if (coupon?.isActive && subtotal >= (coupon.minPurchase || 0)) {
    discountCents = Math.round(coupon.discountType === "percentage" ? subtotalCents * coupon.discountValue / 100 : coupon.discountValue * 100);
    discountCents = Math.max(0, Math.min(subtotalCents, discountCents));
  }
  return { subtotal, discountAmount: discountCents / 100, total: Math.max(0, subtotalCents - discountCents) / 100 };
}

export function inspectCheckout(items: CartItem[], products: Product[], applied: Coupon | null, coupons: Coupon[]) {
  const checked = inspectCart(items, products);
  const coupon = coupons.find((candidate) => candidate.id === applied?.id && candidate.code === applied?.code && candidate.isActive) || null;
  const couponChanged = Boolean(applied && (!coupon || ["discountType", "discountValue", "minPurchase"].some((key) => applied[key as keyof Coupon] !== coupon[key as keyof Coupon])));
  return { ...checked, coupon, couponChanged, ...cartTotals(checked.items, coupon) };
}
