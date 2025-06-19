"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const categories = [
  "Tous",
  "Print",
  "Illustration",
  "Charte graphique",
  "Maquettes web",
  "Maquettes mobiles",
  "Développement front-end",
]

const projects = [
  {
    id: 1,
    title: "Identité visuelle",
    category: "Charte graphique",
    image: "/images/logo1.jpg",
  },
  {
    id: 2,
    title: "Application mobile",
    category: "Maquettes mobiles",
    image: "/images/app-mobile.jpg",
  },
  {
    id: 3,
    title: "Site Web Corporate",
    category: "Développement front-end",
    image: "/images/website1.jpg",
  },
  {
    id: 4,
    title: "Brochure",
    category: "Print",
    image: "/images/affiche.jpg",
  },
  {
    id: 5,
    title: "Site web de DJ",
    category: "Maquettes web",
    image: "/images/website2.png",
  },
  {
    id: 6,
    title: "Illustration",
    category: "Illustration",
    image: "/images/illustration.jpg",
  },
  {
    id: 7,
    title: "Logo & Charte Startup",
    category: "Charte graphique",
    image: "/images/logo.jpg",
  },
  {
    id: 9,
    title: "École de formation",
    category: "Développement front-end",
    image: "/images/maquette-web.jpg",
  },
  {
    id: 10,
    title: "Carte de visite",
    category: "Print",
    image: "/images/carte-visite.jpg",
  },
  {
    id: 11,
    title: "Site web Auto moto",
    category: "Maquettes web",
    image: "/images/website3.webp",
  },
  {
    id: 12,
    title: "Mascotte",
    category: "Illustration",
    image: "/images/mascotte.jpg",
  },
]

export default function PortfolioGrid() {
  const [activeCategory, setActiveCategory] = useState("Tous")

  const filteredProjects =
    activeCategory === "Tous" ? projects : projects.filter((project) => project.category === activeCategory)

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Filtres */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
            <Button
            key={category}
            onClick={() => setActiveCategory(category)}
            variant={activeCategory === category ? "default" : "outline"}
            className={`cursor-pointer font-[var(--font-montserrat)] ${
                activeCategory === category
                ? "bg-[#e30e1b] hover:bg-[#c50d18] text-white"
                : "border-white text-black hover:bg-gray-100 hover:text-black"
            }`}
            >
            {category}
            </Button>
            ))}
          </div>

          {/* Grille de projets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="bg-white border-gray-300 hover:border-[#e30e1b] transition-all duration-300 hover:scale-105 cursor-pointer group"
              >
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <Image
                      src={project.image || "/placeholder.svg"}
                      alt={project.title}
                      width={450}
                      height={300}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-black mb-2 font-[var(--font-montserrat)]">
                      {project.title}
                    </h3>
                    <Badge
                      variant="secondary"
                      className="bg-gray-100 text-[#e30e1b] border border-gray-300 font-[var(--font-montserrat)]"
                    >
                      {project.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Message si aucun projet */}
          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg font-[var(--font-montserrat)]">
                Aucun projet trouvé dans cette catégorie.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}