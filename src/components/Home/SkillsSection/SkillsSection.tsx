import { Card, CardContent } from "@/components/ui/card"
import { Paintbrush, Code, Server } from "lucide-react"
import { motion } from "framer-motion" // Importez motion

// Définissons les données des cartes pour faciliter la boucle et les animations
const skillsData = [
  {
    icon: <Paintbrush className="w-12 h-12 mb-4 group-hover:scale-110 group-hover:rotate-[5deg] transition-transform duration-300" color="#e30e1b" />,
    title: "Design Graphique",
  },
  {
    icon: <Code className="w-12 h-12 mb-4 group-hover:scale-110 group-hover:rotate-[5deg] transition-transform duration-300" color="#e30e1b" />,
    title: "Développement Front-end",
  },
  {
    icon: <Server className="w-12 h-12 mb-4 group-hover:scale-110 group-hover:rotate-[5deg] transition-transform duration-300" color="#e30e1b" />,
    title: "Développement Back-end",
  },
]

// Variants pour l'animation des cartes
const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i) => ({ // (i) est l'index pour le délai
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2, // Délai progressif pour chaque carte
      duration: 0.5,
      ease: "easeOut",
    },
  }),
}

export default function SkillsSection() {
  return (
    <section className="py-16 bg-white text-black">
      <div className="container mx-auto px-4 text-center">
        <motion.h2
          className="text-xl sm:text-3xl font-bold mb-6 text-[#e30e1b] leading-tight"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} // L'animation se joue une seule fois
          transition={{ duration: 0.5 }}
        >
          Mes compétences
        </motion.h2>
        <motion.p
          className="text-gray-700 my-6 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Voici les domaines dans lesquels je suis spécialisé et que je mets à votre service.
        </motion.p>

        <div className="grid gap-8 grid-cols-1 md:grid-cols-3 mx-5">
          {skillsData.map((skill, index) => (
            <motion.div
              key={skill.title}
              custom={index} // Passe l'index pour le délai personnalisé
              variants={cardVariants}
              initial="hidden"
              whileInView="visible" // Déclenche l'animation quand l'élément est visible
              viewport={{ once: true, amount: 0.3 }} // Se déclenche une fois, quand 30% de la carte est visible
              className="group" // Ajout de la classe 'group' pour les effets de survol sur les enfants
            >
              <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ease-in-out bg-white text-black h-full">
                <CardContent className="py-10 flex flex-col items-center justify-center h-full"> {/* Ajout de justify-center et h-full pour l'alignement */}
                  {skill.icon}
                  <h3 className="text-xl font-semibold">{skill.title}</h3>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
