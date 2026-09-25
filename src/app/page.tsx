"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProductCatalog from "@/components/ProductCatalog";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfd] text-[#111113]">
      {/* Main Navigation */}
      <Navbar />

      {/* Main Content: 100% Tienda Comercial Pura */}
      <main className="flex-1">
        {/* 1. Commercial Hero Showcase */}
        <HeroSection />

        {/* 2. Real E-Commerce Product Catalog with Vertical Filters & Grid */}
        <ProductCatalog />
      </main>

      {/* Clean Customer Footer */}
      <Footer />
    </div>
  );
}
