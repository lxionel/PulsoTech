export interface ProductColor {
  name: string;
  hex: string;
  image: string;
}

export interface ProductSpecItem {
  label: string;
  value: string;
}

export interface ProductSpecs {
  battery?: string;
  anc?: string;
  driver?: string;
  connectivity?: string;
  weight?: string;
  latency?: string;
  [key: string]: string | undefined;
}

export interface SoundProfile {
  type: string;
  description: string;
  bass: number; // 0 - 100
  mid: number;  // 0 - 100
  treble: number; // 0 - 100
}

export interface Product {
  id: string; // Código numérico de 6 dígitos (ej: 100234)
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  price: number;
  originalPrice?: number;
  brand: string;
  category: string;
  inStock: boolean;
  stockCount: number;
  isFeatured?: boolean;
  isNew?: boolean;
  rating: number;
  reviewsCount: number;
  colors: ProductColor[];
  specs: ProductSpecs;
  customSpecs?: ProductSpecItem[];
  soundProfile?: SoundProfile;
  features: string[];
  tags: string[];
  images?: string[];
  videoUrl?: string;
}

export interface CartItem {
  product: Product;
  selectedColor: ProductColor;
  quantity: number;
}

export interface OrderCustomerInfo {
  name: string;
  phone: string;
  city: string;
  address: string;
  notes?: string;
  paymentMethod: "whatsapp_transfer" | "cash_on_delivery" | "card";
}

export interface Order {
  id: string;
  customer: OrderCustomerInfo;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: "pendiente" | "confirmado" | "en_camino" | "entregado" | "cancelado";
  channel: "WhatsApp" | "Web" | "Presencial";
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minPurchase: number;
  isActive: boolean;
}
