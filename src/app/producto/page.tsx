import type { Metadata } from "next";
import ProductQueryClient from "@/components/ProductQueryClient";

export const metadata: Metadata = { robots: { index: false, follow: true } };
export default function ProductQueryPage() { return <ProductQueryClient />; }
