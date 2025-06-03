"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { motion, Variants } from 'framer-motion';

const AboutSection = () => {

  // Variantes d'animation pour Framer Motion
  const sectionVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.5,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const imageVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.section
      className={`py-16 md:py-24 bg-black text-white overflow-hidden`}
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="container mx-auto px-10 sm:px-12 lg:px-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-16 items-center">

          {/* Colonne Texte */}
          <motion.div className="md:col-span-3 space-y-4" variants={itemVariants}>
            <motion.h2
              // Titre en rouge
              className={`text-xl sm:text-3xl font-bold mb-6 text-[#e30e1b] leading-tight`}
              variants={itemVariants}
            >
              À Propos de Moi
            </motion.h2>
            {/* Texte principal */}
            <motion.p className={`text-base text-gray-200 leading-relaxed`} variants={itemVariants}>
              UI Designer & Développeur Front-End avec <span className="font-semibold text-[#e30e1b]">9 ans d'expérience</span>,
              passionné par la création d'interfaces utilisateur (UI) intuitives et l'intégration web performante.
            </motion.p>
            <motion.p className={`text-base text-gray-200 leading-relaxed`} variants={itemVariants}>
              Autonome et rigoureux, je maîtrise les aspects de conception visuelle et le développement front-end
              (Next.js, ReactJS).
            </motion.p>
            <motion.p className={`text-base text-gray-200 mb-4 leading-relaxed`} variants={itemVariants}>
              Je recherche une opportunité pour mettre à profit mes compétences et mon expertise au sein d'une
              équipe dynamique, afin de contribuer à des projets stimulants.
            </motion.p>
            <motion.div variants={itemVariants} className="mt-8">
              <Button
                asChild
                variant="default" // Le variant outline est bien pour un fond sombre
                size="default"
                className={`
                   mt-8 bg-[#e30e1b] hover:bg-red-700 text-white text-base px-6 py-3 rounded-md transition duration-300
                `}
              >
                <Link href="/a-propos">En savoir plus</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Colonne Image */}
          <motion.div
            className="md:col-span-2 flex justify-center md:justify-end"
            variants={imageVariants}
          >
            <motion.div
              className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <Image
                src="/profile-photo.jpg"
                alt="Photo de Hichem Ben Ayed"
                layout="fill"
                objectFit="cover"
                // Bordure de l'image
                className="rounded-full shadow-xl border-4 border-white hover:border-[#e30e1b] transition-colors duration-300"
                priority
              />

            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default AboutSection;