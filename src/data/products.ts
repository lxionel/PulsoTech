import { Product } from "@/types";
import { getAssetUrl } from "@/utils/paths";

export const STORE_SETTINGS = {
  name: "PulsoTech",
  tagline: "Audífonos Originales & Accesorios Tecnológicos",
  description: "Especialistas en audífonos originales y accesorios tecnológicos con garantía local.",
  whatsappNumber: "51902377567",
  whatsappDisplay: "+51 902 377 567",
  currencySymbol: "S/ ",
  currencyCode: "PEN",
  freeShippingThreshold: 150,
  shippingCost: 12.0,
  guaranteeMonths: 12,
  deliveryTime: "Entrega el mismo día",
  social: {
    instagram: "https://www.instagram.com/lionel_a5/",
    tiktok: "https://www.tiktok.com/@lionel_a5",
    facebook: "https://www.facebook.com/Lionel.a6?locale=es_LA",
  },
};

export const TECH_CATEGORIES = [
  { id: "todos", name: "Todos los productos", count: 3, active: true },
];

export const PRODUCTS: Product[] = [
  {
    id: "redmi-buds-6-play",
    name: "Redmi Buds 6 Play",
    slug: "redmi-buds-6-play",
    subtitle: "Sin cancelación de ruido · 36h de batería con estuche · Resistencia IPX4",
    description:
      "Audífonos True Wireless originales Xiaomi Redmi Buds 6 Play. Diseño ergonómico ultraligero con diafragma dinámico de 10mm, hasta 36 horas de autonomía con el estuche de carga y resistencia al sudor y salpicaduras IPX4.",
    price: 49.0,
    originalPrice: undefined,
    brand: "Xiaomi",
    category: "in-ear",
    inStock: true,
    stockCount: 15,
    isFeatured: true,
    isNew: false,
    rating: 0,
    reviewsCount: 0,
    colors: [
      {
        name: "Negro",
        hex: "#18181b",
        image: getAssetUrl("/images/products/redmi-buds-6-play.png"),
      },
      {
        name: "Blanco",
        hex: "#FFFFFF",
        image: getAssetUrl("/images/products/redmi-buds-6-play.png"),
      },
      {
        name: "Azul",
        hex: "#1d4ed8",
        image: getAssetUrl("/images/products/redmi-buds-6-play.png"),
      },
    ],
    images: [
      getAssetUrl("/images/products/redmi-buds-6-play.png"),
      getAssetUrl("/images/products/redmi-buds-6-play-earbuds.png"),
    ],
    specs: {
      battery: "36h",
      anc: "Sin cancelación",
      driver: "Dinámico de 10mm",
      connectivity: "Bluetooth 5.4",
      weight: "3.6g por auricular",
      latency: "Baja latencia",
    },
    soundProfile: {
      type: "Audio Equilibrado",
      description: "Perfil de sonido balanceado con voces claras y agudos nítidos para uso diario.",
      bass: 78,
      mid: 85,
      treble: 82,
    },
    features: [
      "Sin cancelación de ruido (Aislamiento acústico pasivo)",
      "Hasta 36 horas de batería total con estuche de carga",
      "Resistencia a salpicaduras y sudor con certificación IPX4",
      "Conexión Bluetooth 5.4 rápida y estable",
      "Carga rápida: 10 minutos de carga para hasta 3 horas de música",
    ],
    tags: ["Audio", "In-Ear", "Xiaomi", "Redmi", "Batería 36h"],
  },
  {
    id: "redmi-buds-8-lite",
    name: "Redmi Buds 8 Lite",
    slug: "redmi-buds-8-lite",
    subtitle: "ANC 42dB · 36h de batería con estuche · Resistencia IP54",
    description:
      "Audífonos True Wireless originales Xiaomi Redmi Buds 8 Lite (Modelo 2026). Equipados con Cancelación Activa de Ruido (ANC) de hasta 42dB, diafragma dinámico de 12.4mm con diafragma de titanio, 36h de batería total y certificación IP54.",
    price: 89.0,
    originalPrice: undefined,
    brand: "Xiaomi",
    category: "in-ear",
    inStock: true,
    stockCount: 12,
    isFeatured: true,
    isNew: true,
    rating: 0,
    reviewsCount: 0,
    colors: [
      {
        name: "Beige",
        hex: "#f5f0e6",
        image: getAssetUrl("/images/products/redmi-buds-8-lite.png"),
      },
      {
        name: "Negro",
        hex: "#18181b",
        image: getAssetUrl("/images/products/redmi-buds-8-lite.png"),
      },
      {
        name: "Blanco",
        hex: "#FFFFFF",
        image: getAssetUrl("/images/products/redmi-buds-8-lite.png"),
      },
      {
        name: "Azul",
        hex: "#1e3a8a",
        image: getAssetUrl("/images/products/redmi-buds-8-lite.png"),
      },
    ],
    images: [
      getAssetUrl("/images/products/redmi-buds-8-lite.png"),
      getAssetUrl("/images/products/redmi-buds-8-lite-features.png"),
    ],
    specs: {
      battery: "36h",
      anc: "42dB",
      driver: "Dinámico 12.4mm Titanio",
      connectivity: "Bluetooth 5.3",
      weight: "3.9g por auricular",
      latency: "Modo baja latencia para gaming",
    },
    soundProfile: {
      type: "Bass Boost & ANC",
      description: "Sonido enriquecido con graves profundos y atenuación activa de ruido ambiente.",
      bass: 88,
      mid: 84,
      treble: 86,
    },
    features: [
      "Cancelación Activa de Ruido Híbrida (ANC) de hasta 42dB",
      "Hasta 36 horas de reproducción total con estuche de carga",
      "Certificación IP54 resistente al polvo y salpicaduras",
      "Doble micrófono con cancelación de ruido ambiental por IA en llamadas",
      "Diafragma de 12.4mm con recubrimiento de titanio",
    ],
    tags: ["Audio", "In-Ear", "ANC 42dB", "Xiaomi", "Redmi", "Nuevo 2026"],
  },
  {
    id: "redmi-buds-7s",
    name: "Redmi Buds 7S",
    slug: "redmi-buds-7s",
    subtitle: "Cancelación activa de ruido · 32h de batería con estuche · Resistencia IP54",
    description:
      "Audífonos True Wireless originales Xiaomi Redmi Buds 7S. Cuentan con sistema de Cancelación Activa de Ruido inteligente, diafragmas de alta fidelidad, 32 horas de autonomía combinada con estuche y protección IP54.",
    price: 139.0,
    originalPrice: undefined,
    brand: "Xiaomi",
    category: "in-ear",
    inStock: true,
    stockCount: 8,
    isFeatured: true,
    isNew: false,
    rating: 0,
    reviewsCount: 0,
    colors: [
      {
        name: "Negro",
        hex: "#18181b",
        image: getAssetUrl("/images/products/redmi-buds-7s.png"),
      },
      {
        name: "Blanco",
        hex: "#FFFFFF",
        image: getAssetUrl("/images/products/redmi-buds-7s.png"),
      },
    ],
    images: [
      getAssetUrl("/images/products/redmi-buds-7s.png"),
      getAssetUrl("/images/products/redmi-buds-7s-earbuds.png"),
    ],
    specs: {
      battery: "32h",
      anc: "Cancelación activa",
      driver: "Hi-Fi de alta resolución",
      connectivity: "Bluetooth 5.3",
      weight: "4.2g por auricular",
      latency: "Ultra baja latencia",
    },
    soundProfile: {
      type: "Hi-Fi Acústica Detallada",
      description: "Respuesta de frecuencia equilibrada con gran definición en instrumentos y voces.",
      bass: 86,
      mid: 90,
      treble: 92,
    },
    features: [
      "Cancelación Activa de Ruido (ANC) inteligente adaptativa",
      "Hasta 32 horas de batería total con estuche de carga",
      "Protección IP54 contra polvo, sudor y lluvia",
      "Micrófonos duales para llamadas claras sin eco",
      "Controles táctiles intuitivos para música y llamadas",
    ],
    tags: ["Audio", "In-Ear", "ANC", "Xiaomi", "Redmi", "Hi-Fi"],
  },
];
