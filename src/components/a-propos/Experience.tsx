import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin } from "lucide-react"

const experiences = [
  {
    title: "Stage en développement web",
    company: "BRIDGE TECHNOLOGY",
    period: "03/2025 – 05/2025",
    location: "Paris",
    tasks: [
      "Développement d'une application web de vente de voitures d'occasion",
      "Implémentation des fonctionnalités front-end et back-end avec Next.js",
      "Mise en place et gestion de la base de données avec Supabase",
      "Collaboration étroite avec l'équipe pour assurer une application moderne, fonctionnelle et intuitive",
      "Utilisation de Git pour le suivi de version et la collaboration en équipe",
    ],
  },
  {
    title: "UI Designer - Intégrateur web",
    company: "TRIWEB",
    period: "03/2019 – 04/2024",
    location: "Paris",
    tasks: [
      "Analyse des besoins, comportements et attentes des utilisateurs",
      "Production de wireframes, mockups et prototypes pour la conception d'interfaces",
      "Intégration web sur CMS propriétaires et WordPress",
      "Garantie de la cohérence entre le design visuel et l'expérience utilisateur ciblée",
      "Conception et création de chartes graphiques (identités visuelles)",
    ],
  },
  {
    title: "Designer graphique - Web Master",
    company: "DIGITALBOX",
    period: "05/2016 – 03/2019",
    location: "Paris",
    tasks: [
      "Réalisation de supports imprimés (petits et grands formats)",
      "Gestion et animation de sites web E-Commerce sous WordPress",
      "Conception et création de publications pour les réseaux sociaux",
      "Création et montage de vidéos (Adobe Premiere, After Effects)",
    ],
  },
  {
    title: "Web Designer",
    company: "ALTAIR SOLUTION",
    period: "11/2015 – 04/2016",
    location: "Paris",
    tasks: [
      "Création de contenus visuels pour les réseaux sociaux",
      "Conception de maquettes et intégration de sites web (Bootstrap)",
      "Élaboration de chartes graphiques (identité visuelle)",
      "Production de vidéos promotionnelles (Adobe Premiere, After Effects)",
    ],
  },
  {
    title: "Stage fin d'étude",
    company: "NOVATIS",
    period: "03/2015 – 05/2015",
    location: "Paris",
    tasks: ["Conception d'une identité visuelle et développement d'un site web dynamique pour un centre de formation"],
  },
]

export default function AboutExperience() {
  return (
    <section className="py-20 bg-neutral-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 font-[var(--font-montserrat)] text-[#e30e1b]">
            EXPÉRIENCES PROFESSIONNELLES
          </h2>

          <div className="space-y-8">
            {experiences.map((exp, index) => (
              <Card key={index} className="bg-white border-gray-300 hover:border-[#e30e1b] transition-colors">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl text-black mb-2 font-[var(--font-montserrat)]">
                        {exp.title}
                      </CardTitle>
                      <div className="text-[#e30e1b] font-semibold text-lg font-[var(--font-montserrat)]">
                        {exp.company}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Badge variant="outline" className="border-gray-400 text-gray-700 font-[var(--font-montserrat)]">
                        <Calendar size={14} className="mr-1" />
                        {exp.period}
                      </Badge>
                      <Badge variant="outline" className="border-gray-400 text-gray-700 font-[var(--font-montserrat)]">
                        <MapPin size={14} className="mr-1" />
                        {exp.location}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {exp.tasks.map((task, taskIndex) => (
                      <li
                        key={taskIndex}
                        className="flex items-start gap-3 text-gray-700 font-[var(--font-montserrat)]"
                      >
                        <span className="text-[#e30e1b] mt-2">•</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}