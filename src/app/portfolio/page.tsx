import PortfolioGrid from "@/components/portfolio/portfolio-grid"
import PortfolioHero from "@/components/portfolio/portfolio-hero"


export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-black text-white font-[var(--font-montserrat)]">
      <PortfolioHero />
      <PortfolioGrid />
    </div>
  )
}
