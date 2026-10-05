import type { Metadata } from "next";
import CartPage from "@/components/CartPage";

export const metadata: Metadata = {
  title: "Tu bolsa | PulsoTech",
  robots: { index: false, follow: false },
};

export default function BagPage() {
  return <CartPage />;
}
