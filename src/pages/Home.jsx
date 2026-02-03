import React from "react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import HeroSection from "@/components/core/HomePage/HeroSection";
import FeaturesSection from "@/components/core/HomePage/FeaturesSection";
import StatusStrip from "@/components/core/HomePage/StatusStrip";

function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <Navbar />
      <main className="flex-1">
        <StatusStrip />
        <HeroSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
}

export default Home;

