// src/app/services/[...slugs]/page.tsx
"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// useRouter n'est plus nécessaire ici si on ne redirige plus
// import { useRouter } from 'next/navigation'; 

// Shadcn/UI imports
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils'; 

// Importer le hook et les types du contexte du panier
import { useCart, CartItem, ServiceDataForCart } from '@/contexts/CartContext'; 

// Interface pour la structure d'un service individuel
interface Service {
  id: number;
  nom: string;
  slugs: string; 
  description: string;
  prix: string; 
  image_url: string | null;
  main_category_slugs: string;
  sub_category_slugs: string;
  sub_category_nom: string; 
}

// Interface pour la structure de la réponse de l'API
interface ApiResponse {
  services: Service[];
  pageTitle: string;
}

// Props pour la page, incluant les paramètres de route dynamiques
interface ServicesPageProps {
  params: {
    slugs?: string[]; 
  };
}

// Interface pour les filtres de sous-catégories
interface SubCategoryFilter {
  slugs: string;
  nom: string;
}

const ServicesPage = ({ params }: ServicesPageProps) => {
  // const router = useRouter(); // Plus besoin pour la redirection immédiate
  
  const slugArray = useMemo(() => {
    if (!params?.slugs || params.slugs.length === 0) return [];
    return params.slugs; 
  }, [params?.slugs]);

  const mainCategorySlug = useMemo(() => slugArray.length > 0 ? slugArray[0] : undefined, [slugArray]);
  const initialSubCategorySlug = useMemo(() => slugArray.length > 1 ? slugArray[1] : undefined, [slugArray]);

  const [pageData, setPageData] = useState<ApiResponse>({ services: [], pageTitle: "Chargement..." });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableSubCategories, setAvailableSubCategories] = useState<SubCategoryFilter[]>([]);
  const [selectedSubCategorySlug, setSelectedSubCategorySlug] = useState<string | null>(null);

  const { addToCart, isCartLoading: isCartContextUpdating } = useCart();

  // Nouvel état pour le message de confirmation
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);
  const [isErrorNotification, setIsErrorNotification] = useState(false);


  useEffect(() => {
    // ... (Logique useEffect complète pour fetchServicesAndDeriveFilters comme avant) ...
    // Assurez-vous que cette logique fonctionne bien et met à jour pageData et isLoading
    let componentIsMounted = true;
    // ... (toute la logique de fetch et de gestion des slugs de la réponse précédente) ...
    const fetchServicesAndDeriveFilters = async () => {
      if (!componentIsMounted) return;
      setIsLoading(true); setError(null);
      let apiUrl = `/api/services/list?mainCat=${mainCategorySlug}`;
      if (initialSubCategorySlug) apiUrl += `&subCat=${initialSubCategorySlug}`;
      try {
        const response = await fetch(apiUrl);
        if (!componentIsMounted) return;
        if (!response.ok) { const errTxt = await response.text().catch(() => `Erreur API ${response.status}`); throw new Error(`Échec API (${response.status}): ${errTxt}`); }
        const data: ApiResponse = await response.json();
        if (!componentIsMounted) return;
        setPageData(data);
        if (data.services && data.services.length > 0) {
          const subCats = data.services.reduce((acc, service) => { if (service.sub_category_slugs && service.sub_category_nom && !acc.find(sc => sc.slugs === service.sub_category_slugs)) { acc.push({ slugs: service.sub_category_slugs, nom: service.sub_category_nom }); } return acc; }, [] as SubCategoryFilter[]);
          subCats.sort((a, b) => a.nom.localeCompare(b.nom));
          setAvailableSubCategories(subCats);
          if (initialSubCategorySlug && subCats.some(sc => sc.slugs === initialSubCategorySlug)) { setSelectedSubCategorySlug(initialSubCategorySlug); } else { setSelectedSubCategorySlug(null); }
        } else { setAvailableSubCategories([]); setSelectedSubCategorySlug(null); }
      } catch (err: any) { if (componentIsMounted) { setError(err.message); setPageData({services: [], pageTitle: "Erreur"});}}
      finally { if (componentIsMounted) setIsLoading(false); }
    };

    if (typeof params?.slugs === 'undefined') { setIsLoading(true); return () => { componentIsMounted = false; }; }
    if (params.slugs.length === 0) { if (componentIsMounted) { setPageData({ services: [], pageTitle: "Tous nos Services" }); setAvailableSubCategories([]); setSelectedSubCategorySlug(null); setIsLoading(false); } return () => { componentIsMounted = false; }; }
    if (!mainCategorySlug) { if (componentIsMounted) { setError("Erreur chemin"); setPageData({ services: [], pageTitle: "Erreur" }); setIsLoading(false); } return () => { componentIsMounted = false; }; }
    
    fetchServicesAndDeriveFilters();
    return () => { componentIsMounted = false; };
  }, [params?.slugs, mainCategorySlug, initialSubCategorySlug]);

  const filteredServices = useMemo(() => {
    if (!pageData?.services) return [];
    if (!selectedSubCategorySlug) return pageData.services;
    return pageData.services.filter(service => service.sub_category_slugs === selectedSubCategorySlug);
  }, [pageData?.services, selectedSubCategorySlug]);

  const handleAddToCart = (service: Service) => {
    if (!service || typeof service.id === 'undefined' || typeof service.prix === 'undefined') {
      setConfirmationMessage("Erreur: Données du service incorrectes.");
      setIsErrorNotification(true);
      setTimeout(() => setConfirmationMessage(null), 3000);
      return;
    }
    const prixNumerique = typeof service.prix === 'string' ? parseFloat(service.prix) : service.prix;
    if (isNaN(prixNumerique)) {
      setConfirmationMessage("Erreur: Prix du service invalide.");
      setIsErrorNotification(true);
      setTimeout(() => setConfirmationMessage(null), 3000);
      return;
    }

    const itemDataForContext: ServiceDataForCart = {
      service_id: service.id, nom: service.nom, prix_unitaire: prixNumerique,
      image_url: service.image_url, slugs: service.slugs,
      main_category_slugs: service.main_category_slugs, sub_category_slugs: service.sub_category_slugs,
    };
    
    addToCart(itemDataForContext, 1)
      .then(() => {
        setConfirmationMessage(`${service.nom} a été ajouté à votre panier !`);
        setIsErrorNotification(false);
        setTimeout(() => setConfirmationMessage(null), 3000); 
      })
      .catch(error => {
        console.error("ServicesPage - handleAddToCart: Erreur context.addToCart:", error);
        setConfirmationMessage("Erreur lors de l'ajout. Veuillez réessayer.");
        setIsErrorNotification(true);
        setTimeout(() => setConfirmationMessage(null), 3000);
      });
  };

  if (isLoading && !pageData?.services.length) { // Ajuster pour montrer le contenu si on recharge
    return <div className="bg-black text-white min-h-screen flex items-center justify-center"><div className="text-xl">Chargement des services...</div></div>; 
  }
  if (error && !pageData?.services.length) { 
    return <div className="bg-black text-white min-h-screen flex items-center justify-center"><div className="text-xl text-[#e30e1b]">Erreur: {error}</div></div>; 
  }
  // pageData est initialisé avec un titre par défaut.

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 relative"> {/* Ajout de relative pour positionner le toast */}
        
        {/* Message de confirmation flottant */}
        {confirmationMessage && (
          <div 
            // Appliquer la classe d'animation si vous l'avez définie dans globals.css et tailwind.config.js
            className={`fixed bottom-5 right-5 p-4 rounded-md shadow-lg text-white text-sm z-[100] animate-fadeInOut
                        ${isErrorNotification ? 'bg-red-600' : 'bg-green-600'}`}
            role="alert"
          >
            {confirmationMessage}
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center tracking-tight mb-8">
          <span className="bg-gradient-to-r from-[#e30e1b] to-red-500 bg-clip-text text-transparent">
            {pageData.pageTitle}
          </span>
          {isLoading && <span className="text-sm text-gray-400 absolute top-0 right-0 -mt-4 animate-pulse">(mise à jour...)</span>}
        </h1>

        {/* Section des filtres de sous-catégories */}
        {!isLoading && availableSubCategories.length > 1 && (
          <div className="mb-8 flex flex-wrap justify-center gap-2 sm:gap-3">
            <Button
              onClick={() => setSelectedSubCategorySlug(null)}
              variant={selectedSubCategorySlug === null ? "default" : "outline"}
              className={cn("text-sm sm:text-base px-4 py-2 rounded-md transition-colors duration-200", selectedSubCategorySlug === null ? "bg-[#e30e1b] text-white border-[#e30e1b] hover:bg-[#c50d18]" : "bg-transparent text-gray-300 border-gray-600 hover:bg-gray-700 hover:border-gray-500 hover:text-white")}
            >
              Toutes
            </Button>
            {availableSubCategories.map(subCat => (
              <Button
                key={subCat.slugs}
                onClick={() => setSelectedSubCategorySlug(subCat.slugs)}
                variant={selectedSubCategorySlug === subCat.slugs ? "default" : "outline"}
                className={cn("text-sm sm:text-base px-4 py-2 rounded-md transition-colors duration-200", selectedSubCategorySlug === subCat.slugs ? "bg-[#e30e1b] text-white border-[#e30e1b] hover:bg-[#c50d18]" : "bg-transparent text-gray-300 border-gray-600 hover:bg-gray-700 hover:border-gray-500 hover:text-white")}
              >
                {subCat.nom}
              </Button>
            ))}
          </div>
        )}

        {/* Affichage des services filtrés */}
        {filteredServices.length === 0 && !isLoading ? (
          <p className="text-center text-gray-400 text-lg mt-10">Aucun service disponible pour cette sélection.</p>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
            {filteredServices.map((service) => (
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
                      <Image src={service.image_url} alt={service.nom} fill sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw" className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-110" priority={false} /> 
                    ) : ( 
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center"><span className="text-gray-500">Image indisponible</span></div> 
                    )}
                  </Link>
                </CardHeader>
                <CardContent className="p-4 flex flex-col flex-grow">
                  <CardTitle className="text-lg lg:text-xl font-bold mb-1 text-black transition-colors duration-300">
                    <Link href={`/services/${service.main_category_slugs}/${service.sub_category_slugs}/${service.slugs}`} className="hover:text-[#e30e1b]">{service.nom}</Link>
                  </CardTitle>
                  <CardDescription className="text-gray-700 text-xs sm:text-sm mb-3 flex-grow min-h-[60px] line-clamp-3">{service.description}</CardDescription>
                </CardContent>
                <CardFooter className="p-4 pt-2 bg-gray-50 border-t border-gray-200 flex flex-col items-stretch gap-2">
                    <p className="text-xl font-bold text-[#e30e1b] text-center sm:text-left">{parseFloat(service.prix).toFixed(2)} €</p>
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-2 text-xs sm:text-sm" 
                      onClick={() => handleAddToCart(service)} 
                      disabled={isCartContextUpdating} 
                      size="md" 
                    >
                      {isCartContextUpdating ? 'Ajout...' : 'Ajouter au Panier'}
                    </Button>
                    <Button 
                      asChild 
                      variant="outline" 
                      className="w-full border-[#e30e1b] text-[#e30e1b] font-semibold hover:bg-[#e30e1b]/10 transition-colors duration-300 py-2 text-xs sm:text-sm" 
                      size="md" 
                    >
                      <Link href={`/services/${service.main_category_slugs}/${service.sub_category_slugs}/${service.slugs}`}>Voir Détails</Link>
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