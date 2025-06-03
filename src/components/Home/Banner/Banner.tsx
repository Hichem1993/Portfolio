import Image from 'next/image';
import Link from 'next/link'; 
import { Button } from "@/components/ui/button"; 


const Banner = () => {
  const montserratClass = "font-[var(--font-montserrat)]";


  return (
    <section className={`relative h-[95vh] min-h-[450px] max-h-[650px] flex items-center justify-center text-center text-white overflow-hidden ${montserratClass}`}>
      {/*  Image de fond */}
      <Image
        src="/banner-background.jpg"
        alt="Arrière-plan de la bannière"
        layout="fill"
        objectFit="cover"
        quality={85}
        priority
        className="z-0"
      />

      {/*  Filtre noir */}
      <div className="absolute inset-0 bg-black opacity-60 z-10"></div> {/* Ajustez l'opacité (0-100) */}

      {/*  Contenu */}
      <div className="relative z-20 flex flex-col items-center p-4 md:p-8">

        {/* Logo */}
        <Link href="/">
            <div className="mb-6 md:mb-8">
                <Image
                    src="/Logo-blanc.png" 
                    alt="Logo Hichem Ben Ayed - Bannière"
                    width={300} 
                    height={180} 
                    className="max-w-[350px] sm:max-w-[250px] md:max-w-[300px] h-auto"
                />
            </div>
        </Link>

        {/* Titre principal */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
          Hichem Ben Ayed
        </h1>

        {/* Sous-titre */}
        <p className="mt-3 md:mt-4 text-lg sm:text-xl md:text-2xl text-white font-medium">
          UI Designer & Développeur Front-End
        </p>

        {/* Bouton "Me Contacter" avec ShadCN UI */}
        <Button
          asChild 
          variant="default" 
          size="default" 
          className="mt-8 bg-[#e30e1b] hover:bg-red-700 text-white text-base px-6 py-3 rounded-md transition duration-300"
        >
          <Link href="/contact">Me Contacter</Link>
        </Button>
      </div>
    </section>
  );
};

export default Banner;