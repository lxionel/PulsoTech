"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
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
        {/* 1. Commercial Hero Showcase (Fixed single image, green button) */}
        <HeroSection />

        {/* 2. Real E-Commerce Product Catalog with Vertical Filters & Grid */}
        <ProductCatalog />

        {/* 3. Simple 3-Step Buying Guide */}
        <HowToBuy />

        {/* 4. Frequently Asked Questions */}
        <FaqSection />
      </main>

      {/* Clean Customer Footer */}
      <Footer />
    </div>
  );
}
