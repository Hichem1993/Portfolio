"use client";

import AboutSection from "@/components/Home/AboutSection/AboutSection";
import Banner from "@/components/Home/Banner/Banner";
import PortfolioSection from "@/components/Home/PortfolioSection/PortfolioSection";
import SkillsSection from "@/components/Home/SkillsSection/SkillsSection";
import TestimonialsSection from "@/components/Home/TestimonialsSection/TestimonialsSection";


export default function HomePage() {
  const handleTestClick = () => {
    alert("Le bouton Shadcn UI fonctionne !");
  };

  return (
      <>
        <Banner />
        <AboutSection />
        <SkillsSection />
        <PortfolioSection />
        <TestimonialsSection />
      </>
  );
}