import AboutExperience from "@/components/a-propos/Experience"
import AboutHero from "@/components/a-propos/hero"
import AboutProfile from "@/components/a-propos/Profil"
import type { Metadata } from "next"


export const metadata: Metadata = {
  title: "À propos - Hichem Ben Ayed | UI Designer & Développeur Front-End",
  description:
    "UI Designer & Développeur Front-End avec 9 ans d'expérience, passionné par la création d'interfaces utilisateur (UI) intuitives et l'intégration web performante.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white font-[var(--font-montserrat)]">
        <AboutHero />
        <AboutProfile />
        <AboutExperience />
    </div>
  )
}