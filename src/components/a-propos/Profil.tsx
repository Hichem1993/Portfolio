import { Card, CardContent } from "@/components/ui/card"

export default function AboutProfile() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl text-[#e30e1b] font-bold text-center mb-12 font-[var(--font-montserrat)]">
            PROFIL PROFESSIONNEL
          </h2>

          <Card className="bg-white border-gray-300">
            <CardContent className="p-8">
              <p className="text-lg leading-relaxed text-gray-800 font-[var(--font-montserrat)]">
                UI Designer & Développeur Front-End avec{" "}
                <span className="text-[#e30e1b] font-semibold">9 ans d'expérience</span>, passionné par la création
                d'interfaces utilisateur (UI) intuitives et l'intégration web performante. Autonome et rigoureux, je
                maîtrise les aspects de conception visuelle et le développement front-end (Next.js, ReactJS).
              </p>
              <p className="text-lg leading-relaxed text-gray-800 mt-4 font-[var(--font-montserrat)]">
                Je recherche une opportunité pour mettre à profit mes compétences et mon expertise au sein d'une équipe
                dynamique, afin de contribuer à des projets stimulants.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
