"use client"

import Link from "next/link"
import Image from "next/image"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"  // Import des composants du carousel personnalisés
import { Button } from "@/components/ui/button"  // Import du composant Button personnalisé

export default function PortfolioSection() {
  // Tableau contenant les projets à afficher dans le carousel
  const projects = [
    {
      title: "Affiche publicitaire",
      category: "Impression",
      image: "/images/affiche.jpg",
    },
    {
      title: "Création de site web",
      category: "Design graphique et intégration web",
      image: "/images/website.png",
    },
    {
      title: "Logo en arabe",
      category: "Charte graphique",
      image: "/images/logo.jpg",
    },
    {
      title: "Application Mobile",
      category: "Design d'Interface (UI)",
      image: "/images/app-mobile.jpg",
    },
    {
      title: "Papier à en-tête",
      category: "Illustration",
      image: "/images/papier-entete.webp",
    },
    {
      title: "Maquette de site web",
      category: "Design d'Interface (UI)",
      image: "/images/maquette-web.jpg",
    },
  ]

  return (
    // Section principale avec padding vertical, fond noir et texte blanc
    <section className="py-16 bg-black text-white">
      <div className="container mx-auto px-4 text-center">
        {/* Titre de la section avec styles pour taille, couleur et marge */}
        <h2 className="text-xl sm:text-3xl font-bold mb-8 text-[#e30e1b] leading-tight">Un regard sur mon travail</h2>

        {/* Composant Carousel englobant le slider */}
        <Carousel className="w-full max-w-6xl mx-auto mb-10 relative px-2 mt-4">
          {/* Contenu du carousel (les slides) */}
          <CarouselContent className="overflow-visible">
            {/* On mappe sur chaque projet pour créer un item du carousel */}
            {projects.map((project, index) => (
              <CarouselItem
                key={index}  // Clé unique pour React
                className="basis-full sm:basis-1/2 md:basis-1/3 px-2 first:pl-4"
              >
                {/* Carte du projet avec fond neutre, arrondi, ombre et effet au hover */}
                <div className="flex flex-col h-full bg-neutral-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
                  {/* Conteneur pour l'image avec hauteur fixe et position relative */}
                  <div className="relative h-48 w-full">
                    {/* Composant Image de Next.js pour optimiser les images */}
                    <Image
                      src={project.image}  
                      alt={project.title}   
                      fill
                      className="object-cover"
                    />
                  </div>
                  {/* Partie texte avec padding et disposition en flex */}
                  <div className="p-4 text-left flex-grow flex flex-col justify-between">
                    <div>
                      {/* Titre du projet */}
                      <h3 className="text-lg font-semibold text-white">
                        {project.title}
                      </h3>
                      {/* Catégorie du projet, en texte gris clair */}
                      <p className="text-sm text-gray-300">
                        {project.category}
                      </p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Boutons de navigation du carousel (précédent / suivant) */}
          <CarouselPrevious className="bg-white/10 text-white hover:bg-[#e30e1b] hover:text-white sm:flex hidden"  />
          <CarouselNext className="bg-white/10 text-white hover:bg-[#e30e1b] hover:text-white sm:flex hidden" />
        </Carousel>

        {/* Bouton qui redirige vers la page complète du portfolio */}
        <Button
          asChild
          variant="default"
          size="default"
          className="mt-8 bg-[#e30e1b] hover:bg-red-700 text-white text-base px-6 py-3 rounded-md transition duration-300"
        >
          <Link href="/portfolio">Voir tous mes projets</Link>
        </Button>
      </div>
    </section>
  )
}