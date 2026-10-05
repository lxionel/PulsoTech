import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { ProductsProvider } from "@/context/ProductsContext";
import FloatingWidgets from "@/components/FloatingWidgets";
import { ComparisonProvider } from "@/context/ComparisonContext";
import ProductComparison from "@/components/ProductComparison";

const plusJakarta = localFont({
  src: "./fonts/plus-jakarta-sans-latin.woff2",
  variable: "--font-sans",
  weight: "300 800",
  style: "normal",
  display: "swap",
});

const spaceGrotesk = localFont({
  src: "./fonts/space-grotesk-latin.woff2",
  variable: "--font-display",
  weight: "400 700",
  style: "normal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PulsoTech",
  description:
    "Tecnología para tu día a día en Chimbote. Pedidos por WhatsApp, entregas coordinadas y atención personalizada.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${plusJakarta.variable} ${spaceGrotesk.variable} h-full antialiased scroll-smooth`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col font-sans bg-[#fbfbfd] text-[#111113] selection:bg-neutral-900 selection:text-white"
        suppressHydrationWarning
      >
        <ProductsProvider>
          <CartProvider>
            <ComparisonProvider>
              {children}
              <FloatingWidgets />
              <ProductComparison />
            </ComparisonProvider>
          </CartProvider>
        </ProductsProvider>
      </body>
    </html>
  );
}
