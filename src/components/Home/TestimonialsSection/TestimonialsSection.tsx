"use client"

import Image from "next/image"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Dupont",
    role: "Fondatrice de GreenMood",
    avatar: "/images/avatar-femme.png",
    rating: 5,
    quote:
      "Une collaboration exceptionnelle ! Le design est à la fois moderne et fonctionnel. Je recommande à 100%.",
  },
  {
    name: "Julien Martin",
    role: "CTO chez StartTech",
    avatar: "/images/avatar-homme.png",
    rating: 4,
    quote:
      "Très satisfait du professionnalisme. Le projet a été livré dans les délais avec un très bon suivi.",
  },
  {
    name: "Claire Moreau",
    role: "Responsable marketing",
    avatar: "/images/avatar-femme.png",
    rating: 5,
    quote:
      "Créatif, rigoureux, et à l’écoute. Le résultat a dépassé nos attentes. Merci pour ce super travail !",
  },
]

export default function TestimonialsSection() {
  return (
    <section className="py-16 bg-[#171717] text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-12">Témoignages de clients</h2>

        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-black rounded-xl p-6 text-left shadow-md hover:shadow-lg transition"
            >
              <div className="flex items-center mb-4 text-[#e30e1b]">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} size={20} fill="#e30e1b" className="mr-1" />
                ))}
              </div>

              <p className="text-sm text-gray-300 italic mb-6">
                “{testimonial.quote}”
              </p>

              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
