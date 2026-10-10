import type { Metadata } from "next";
import OrderTrackingPage from "@/components/OrderTrackingPage";

export const metadata: Metadata = {
  title: "Tu pedido | PulsoTech",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default function Page() { return <OrderTrackingPage />; }
