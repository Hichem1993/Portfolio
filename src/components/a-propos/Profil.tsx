import { Card, CardContent } from "@/components/ui/card"

// Déclaration du composant fonctionnel principal
export default function AboutProfile() {
  return (
    // Section avec un espacement vertical important (padding top et bottom de 20)
    <section className="py-20">
      {/* Conteneur centré avec padding horizontal adaptatif selon la taille de l'écran */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Conteneur avec largeur maximale définie et centré horizontalement */}
        <div className="max-w-4xl mx-auto">
          {/* Titre principal centré, stylisé en rouge avec une police personnalisée */}
          <h2 className="text-4xl text-[#e30e1b] font-bold text-center mb-12 font-[var(--font-montserrat)]">
            PROFIL PROFESSIONNEL
          </h2>

          {/* Carte blanche avec une bordure grise */}
          <Card className="bg-white border-gray-300">
            {/* Contenu de la carte avec du padding intérieur */}
            <CardContent className="p-8">
              {/* Premier paragraphe décrivant le profil professionnel */}
              <p className="text-lg leading-relaxed text-gray-800 font-[var(--font-montserrat)]">
                UI Designer & Développeur Front-End avec{" "}
                <span className="text-[#e30e1b] font-semibold">9 ans d'expérience</span>, passionné par la création
                d'interfaces utilisateur (UI) intuitives et l'intégration web performante. Autonome et rigoureux, je
                maîtrise les aspects de conception visuelle et le développement front-end (Next.js, ReactJS).
              </p>

              {/* Deuxième paragraphe sur les aspirations professionnelles */}
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