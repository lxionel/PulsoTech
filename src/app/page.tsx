"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoryNavShowcase from "@/components/CategoryNavShowcase";
import ProductCatalog from "@/components/ProductCatalog";
import Footer from "@/components/Footer";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfd] text-[#111113]">
      {/* Main Navigation */}
      <Navbar />

      {/* Main Content: 100% Tienda Comercial Pura */}
      <main className="flex-1">
        {/* 1. Commercial Hero Showcase (Panoramic high-impact photography) */}
        <HeroSection />

        {/* 2. Interactive Category Showcase with handcrafted animated illustrations */}
        <CategoryNavShowcase
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* 3. Real E-Commerce Product Catalog with Vertical Filters & Grid */}
        <ProductCatalog
          externalSelectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </main>

      {/* Clean Customer Footer */}
      <Footer />
    </div>
  );
}
