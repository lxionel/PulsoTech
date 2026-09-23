import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import FloatingWidgets from "@/components/FloatingWidgets";
import CartDrawer from "@/components/CartDrawer";
import FavoritesDrawer from "@/components/FavoritesDrawer";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PulsoTech - Tecnología, Audio y Accesorios",
  description:
    "Tienda especializada en audífonos originales y accesorios tecnológicos. Entrega el mismo día con garantía y atención personalizada.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${plusJakarta.variable} ${spaceGrotesk.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#fbfbfd] text-[#111113] selection:bg-neutral-900 selection:text-white">
        <CartProvider>
          {children}
          <CartDrawer />
          <FavoritesDrawer />
          <FloatingWidgets />
        </CartProvider>
      </body>
    </html>
  );
}
