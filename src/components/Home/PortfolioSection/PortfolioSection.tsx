"use client"

import Link from "next/link"
import Image from "next/image"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"

export default function PortfolioSection() {
  const projects = [
    {
      title: "Refonte site e-commerce",
      category: "Web Design",
      image: "/images/project1.jpg",
    },
    {
      title: "Illustration couverture livre",
      category: "Illustration",
      image: "/images/project2.jpg",
    },
    {
      title: "Dashboard UX",
      category: "UI/UX",
      image: "/images/project3.jpg",
    },
    {
      title: "Portfolio personnel",
      category: "Développement Front-end",
      image: "/images/project4.jpg",
    },
    {
      title: "Logo marque textile",
      category: "Branding",
      image: "/images/project5.jpg",
    },
  ]

  return (
    <section className="py-16 bg-black text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-xl sm:text-3xl font-bold mb-8 text-[#e30e1b] leading-tight">Un regard sur mon travail</h2>

        <Carousel className="w-full max-w-6xl mx-auto mb-10 relative px-2 mt-4">
          <CarouselContent className="overflow-visible">
            {projects.map((project, index) => (
              <CarouselItem
                key={index}
                className="basis-full sm:basis-1/2 md:basis-1/3 px-2 first:pl-4"
              >
                <div className="flex flex-col h-full bg-neutral-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
                  <div className="relative h-48 w-full">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 text-left flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {project.title}
                      </h3>
                      <p className="text-sm text-gray-300">
                        {project.category}
                      </p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="bg-white/10 text-white hover:bg-[#e30e1b] hover:text-white sm:flex hidden"  />
          <CarouselNext className="bg-white/10 text-white hover:bg-[#e30e1b] hover:text-white sm:flex hidden" />
        </Carousel>

        <Button
          asChild
          variant="default"
          size="default"
          className="mt-8 bg-[#e30e1b] hover:bg-red-700 text-white text-base px-6 py-3 rounded-md transition duration-300"
        >
          <Link href="/services">Voir tous mes projets</Link>
        </Button>
      </div>
    </section>
  )
}
