"use client";

import AboutSection from "@/components/Home/AboutSection/AboutSection";
import Banner from "@/components/Home/Banner/Banner";


export default function HomePage() {
  const handleTestClick = () => {
    alert("Le bouton Shadcn UI fonctionne !");
  };

  return (
      <>
        <Banner />
        <AboutSection />
      </>
  );
}