import type { Metadata } from "next";
import FavoritesPage from "@/components/FavoritesPage";

export const metadata: Metadata = {
  title: "Mis favoritos | PulsoTech",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <FavoritesPage />;
}
