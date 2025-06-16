import { MapPin, Phone, Mail, Linkedin, Github } from "lucide-react"

// Définition du composant fonctionnel AboutHero
export default function AboutHero() {
  return (
    // Section principale avec padding vertical et fond noir
    <section className="py-20 bg-white">
      {/* Conteneur centré avec marges horizontales responsives */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bloc centré avec largeur maximale */}
        <div className="max-w-4xl mx-auto text-center">
          {/* Nom principal avec taille de texte adaptative et gras */}
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-black">HICHEM BEN AYED</h1>

          {/* Sous-titre (métier) en rouge personnalisé, gras, et espacé */}
          <h2 className="text-2xl md:text-3xl text-[#e30e1b] font-semibold mb-8">
            UI Designer & Développeur Front-End
          </h2>

          {/* Bloc d'informations personnelles (adresse, téléphone, email) */}
          <div className="flex flex-wrap justify-center gap-6 text-black">
            {/* Adresse avec icône */}
            <div className="flex items-center gap-2">
              <MapPin size={20} className="text-[#e30e1b]" />
              <span>Paris, Île-de-France</span>
            </div>

            {/* Téléphone avec icône et lien cliquable */}
            <div className="flex items-center gap-2">
              <Phone size={20} className="text-[#e30e1b]" />
              <a href="tel:0744967207" className="hover:text-white transition-colors">
                07 44 96 72 07
              </a>
            </div>

            {/* Email avec icône et lien cliquable */}
            <div className="flex items-center gap-2">
              <Mail size={20} className="text-[#e30e1b]" />
              <a href="mailto:benayedhicham@gmail.com" className="hover:text-white transition-colors">
                benayedhicham@gmail.com
              </a>
            </div>
          </div>

          {/* Bloc de liens sociaux (LinkedIn, GitHub, Behance) */}
          <div className="flex justify-center gap-6 mt-8">
            {/* Lien LinkedIn avec icône, fond rouge, effet hover */}
            <a
              href="https://linkedin.com/in/hichem-benayed"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#e30e1b] p-3 rounded-lg hover:bg-[#c50d18] transition-colors"
            >
              <Linkedin size={24} />
            </a>

            {/* Lien GitHub avec icône, fond rouge, effet hover */}
            <a
              href="https://github.com/Hichem1993"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#e30e1b] p-3 rounded-lg hover:bg-[#c50d18] transition-colors"
            >
              <Github size={24} />
            </a>

            {/* Lien Behance avec SVG personnalisé (non fourni par lucide-react) */}
            <a
              href="https://behance.net/Hichem1993"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#e30e1b] p-3 rounded-lg hover:bg-[#c50d18] transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988h-6.466v-14.967h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zm-3.466-8.988h3.584c2.508 0 2.906-3-.312-3h-3.272v3zm3.391 3h-3.391v3.016h3.341c3.055 0 2.868-3.016.05-3.016z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
