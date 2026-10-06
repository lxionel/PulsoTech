import { Product } from "@/types";
import catalog from "./catalog-build.json";

export const STORE_SETTINGS = {
  name: "PulsoTech",
  whatsappNumber: "51902377567",
  currencySymbol: "S/ ",
  currencyCode: "PEN",
  social: {
    instagram: "https://www.instagram.com/lionel_a5/",
    tiktok: "https://www.tiktok.com/@lionel_a5",
    facebook: "https://www.facebook.com/Lionel.a6?locale=es_LA",
  },
};

export const PRODUCTS: Product[] = catalog as Product[];
