import React from "react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import HeroSection from "@/components/core/HomePage/HeroSection";
import FeaturesSection from "@/components/core/HomePage/FeaturesSection";
import TrustSection from "@/components/core/HomePage/TrustSection";
import StatusStrip from "@/components/core/HomePage/StatusStrip";
import NamastePopup from "@/components/core/HomePage/NamastePopup";

function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      {/* <NamastePopup /> */}
      <Navbar />
      <main className="flex-1">
        <StatusStrip />
        <HeroSection />
        <TrustSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
}

export default Home;

