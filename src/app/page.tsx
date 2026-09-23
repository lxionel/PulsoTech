"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrustBar from "@/components/TrustBar";
import ProductCatalog from "@/components/ProductCatalog";
import HowToBuy from "@/components/HowToBuy";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfd] text-[#111113]">
      {/* Main Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        {/* 1. Commercial Hero Showcase (Despegatec style) */}
        <HeroSection />

        {/* 2. Retail Value / Trust Bar */}
        <TrustBar />

        {/* 3. Real E-Commerce Product Catalog with Filters and Sorting */}
        <ProductCatalog />

        {/* 4. Simple 3-Step Buying Guide */}
        <HowToBuy />

        {/* 5. Frequently Asked Questions */}
        <FaqSection />
      </main>

      {/* Clean Customer Footer */}
      <Footer />
    </div>
  );
}
