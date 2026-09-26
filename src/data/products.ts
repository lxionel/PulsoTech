import { Product } from "@/types";

export const STORE_SETTINGS = {
  name: "PulsoTech",
  tagline: "Audífonos Originales & Accesorios Tecnológicos",
  description: "Especialistas en audífonos originales y accesorios tecnológicos con garantía local.",
  whatsappNumber: "51902377567",
  whatsappDisplay: "+51 902 377 567",
  currencySymbol: "S/ ",
  currencyCode: "PEN",
  freeShippingThreshold: 0,
  shippingCost: 0,
  guaranteeMonths: 12,
  deliveryTime: "Entrega el mismo día",
  social: {
    instagram: "https://www.instagram.com/lionel_a5/",
    tiktok: "https://www.tiktok.com/@lionel_a5",
    facebook: "https://www.facebook.com/Lionel.a6?locale=es_LA",
  },
};

export const TECH_CATEGORIES = [
  { id: "todos", name: "Todos los productos", count: 0, active: true },
];

export const PRODUCTS: Product[] = [];
