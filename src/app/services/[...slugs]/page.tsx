// src/app/services/[...slugs]/page.tsx
"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Shadcn/UI imports
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"; // Assurez-vous que le chemin est correct
import { Button } from "@/components/ui/button"; // Assurez-vous que le chemin est correct

// Interface pour la structure d'un service individuel
interface Service {
  id: number;
  nom: string;
  slugs: string; // Le slug DU SERVICE lui-même
  description: string;
  prix: string; // Le prix est une chaîne car DECIMAL de SQL est souvent retourné comme string
  image_url: string | null; // URL de l'image du service, peut être null
  main_category_slugs: string; // Slug de la catégorie principale à laquelle ce service appartient
  sub_category_slugs: string;  // Slug de la sous-catégorie à laquelle ce service appartient
}

// Interface pour la structure de la réponse de l'API
interface ApiResponse {
  services: Service[]; // Un tableau d'objets Service
  pageTitle: string;   // Le titre à afficher pour la page actuelle
}

// Props pour la page, incluant les paramètres de route dynamiques
interface ServicesPageProps {
  params: {
    // Si votre dossier est [...slugs], la prop sera `slugs` (pluriel)
    slugs?: string[]; 
  };
}

const ServicesPage = ({ params }: ServicesPageProps) => {
  // Utiliser useMemo pour dériver et stabiliser les slugs à partir des props `params`
  const slugArray = useMemo(() => {
    if (!params?.slugs || params.slugs.length === 0) return [];
    return params.slugs; 
  }, [params?.slugs]);

  const mainCategorySlug = useMemo(() => slugArray.length > 0 ? slugArray[0] : undefined, [slugArray]);
  const subCategorySlug = useMemo(() => slugArray.length > 1 ? slugArray[1] : undefined, [slugArray]);

  // États du composant
  const [pageData, setPageData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Commencer en chargement
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("ServicesPage: useEffect triggered. props.params.slugs:", JSON.stringify(params?.slugs), "Calculated slugArray:", JSON.stringify(slugArray) ,"MainCat:", mainCategorySlug, "SubCat:", subCategorySlug);

    // Condition 1: params.slugs n'est pas encore défini par le routeur.
    if (typeof params?.slugs === 'undefined') {
      console.log("ServicesPage: props.params.slugs est undefined. Attente.");
      setIsLoading(true); 
      return; 
    }

    // Condition 2: Accès à /services/ (params.slugs est un tableau vide [])
    if (params.slugs.length === 0) {
      // Vérifier si l'URL actuelle est vraiment /services/ pour éviter des faux positifs
      if (typeof window !== 'undefined' && (window.location.pathname === '/services' || window.location.pathname === '/services/')) {
        console.log("ServicesPage: URL de base /services/, affichage de 'Tous nos Services'.");
        setPageData({ services: [], pageTitle: "Tous nos Services" });
        setIsLoading(false);
      } else {
        // params.slugs est vide, mais ce n'est pas la page /services/ -> chemin potentiellement invalide
        console.log("ServicesPage: params.slugs est un tableau vide, mais pas l'URL /services/. Chemin invalide.");
        setError("Chemin de service non spécifié ou invalide.");
        setPageData({ services: [], pageTitle: "Page non trouvée"});
        setIsLoading(false);
      }
      return; 
    }

    // Condition 3: Slugs présents mais mainCategorySlug est undefined (ne devrait pas arriver si la logique slugArray est correcte)
    if (!mainCategorySlug) { 
        console.error("ServicesPage: mainCategorySlug est undefined malgré params.slugs non vide. Vérifiez la logique d'extraction des slugs.");
        setError("Erreur interne: Impossible de déterminer la catégorie principale.");
        setPageData({ services: [], pageTitle: "Erreur de chemin" });
        setIsLoading(false);
        return;
    }
    
    // Si on arrive ici, mainCategorySlug EST défini, on peut lancer le fetch.
    const fetchServices = async () => {
      setIsLoading(true); 
      setError(null); // Réinitialiser les erreurs précédentes
      let apiUrl = '/api/services/list?';
      const queryParams = new URLSearchParams();

      queryParams.append('mainCat', mainCategorySlug);
      if (subCategorySlug) {
        queryParams.append('subCat', subCategorySlug);
      }
      apiUrl += queryParams.toString();
      console.log("ServicesPage: Appel API avec URL:", apiUrl);

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: `Réponse d'erreur non JSON (statut: ${response.status})` }));
          console.error("ServicesPage: Erreur de réponse API:", response.status, errorData);
          throw new Error(errorData.error || `Échec de la récupération des services`);
        }
        const data: ApiResponse = await response.json();
        console.log("ServicesPage: Données reçues de l'API:", data);
        setPageData(data);
      } catch (err: any) {
        console.error("ServicesPage: Erreur dans fetchServices:", err);
        setError(err.message);
        setPageData({ services: [], pageTitle: "Erreur de chargement des services" }); // Fournir un état de repli
      } finally {
        setIsLoading(false); 
        console.log("ServicesPage: fetchServices terminé, isLoading:", false);
      }
    };

    fetchServices();

  }, [params?.slugs, mainCategorySlug, subCategorySlug]); // Dépendances du useEffect

  // Affichage pendant le chargement initial ou si on attend encore les params
  if (isLoading && !pageData && !error) {
    return <div className="bg-black text-white min-h-screen flex items-center justify-center"><div className="text-xl">Chargement des services...</div></div>;
  }

  // Affichage en cas d'erreur
  if (error) {
    return <div className="bg-black text-white min-h-screen flex items-center justify-center"><div className="text-xl text-[#e30e1b]">Erreur: {error}</div></div>;
  }

  // Affichage si pageData est null après le chargement (ne devrait pas arriver si error est aussi null)
  if (!pageData) {
    return <div className="bg-black text-white min-h-screen flex items-center justify-center"><div className="text-xl">Aucune donnée à afficher. Vérifiez l'URL ou réessayez.</div></div>;
  }

  // Rendu principal de la page
  return (
    <div className="bg-black text-white min-h-screen">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-10 sm:mb-12 text-center">
          <span className="bg-gradient-to-r from-[#e30e1b] to-red-500 bg-clip-text text-transparent">
            {pageData.pageTitle || "Nos Services"}
          </span>
        </h1>

        {pageData.services.length === 0 ? (
          <p className="text-center text-gray-400 text-lg mt-10">
            {slugArray.length === 0 ? "Parcourez nos catégories de services via le menu." : "Aucun service disponible pour cette catégorie pour le moment."}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {pageData.services.map((service) => (
              <Card 
                key={service.id} 
                className="bg-white text-black flex flex-col overflow-hidden rounded-xl shadow-lg hover:shadow-2xl hover:shadow-[#e30e1b]/30 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
              >
                <CardHeader className="p-0 relative">
                  <Link 
                    href={`/services/${service.main_category_slugs}/${service.sub_category_slugs}/${service.slugs}`}
                    className="block aspect-video overflow-hidden group"
                  >
                    {service.image_url ? (
                      <Image
                        src={service.image_url}
                        alt={service.nom}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                        priority={false} 
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">Image indisponible</span>
                      </div>
                    )}
                  </Link>
                </CardHeader>
                <CardContent className="p-4 flex flex-col flex-grow">
                  <CardTitle className="text-lg lg:text-xl font-bold mb-1 text-black transition-colors duration-300">
                    <Link href={`/services/${service.main_category_slugs}/${service.sub_category_slugs}/${service.slugs}`} className="hover:text-[#e30e1b]">
                        {service.nom}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-gray-700 text-xs sm:text-sm mb-3 flex-grow min-h-[60px] line-clamp-3">
                    {service.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="p-4 pt-2 bg-gray-50 border-t border-gray-200 flex flex-col items-stretch gap-2">
                    <p className="text-xl font-bold text-[#e30e1b] text-center sm:text-left">
                      {parseFloat(service.prix).toFixed(2)} €
                    </p>
                    <Button 
                      asChild 
                      className="w-full bg-[#e30e1b] text-white font-semibold hover:bg-[#c50d18] transition-colors duration-300 py-2 text-xs sm:text-sm"
                    >
                      <Link href={`/services/${service.main_category_slugs}/${service.sub_category_slugs}/${service.slugs}`}>
                        Voir Détails
                      </Link>
                    </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;