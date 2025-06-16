// src/app/services/[mainCatSlug]/[subCatSlug]/[serviceSlug]/page.tsx
"use client";

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Importer useRouter pour la redirection
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart, ServiceDataForCart } from '@/contexts/CartContext'; // Importer depuis CartContext
import { ArrowLeft, ShoppingCart as ShoppingCartIcon, AlertTriangle as AlertTriangleIcon } from 'lucide-react'; // Icônes

// Interface pour les détails du service (doit correspondre à la réponse de l'API)
interface ServiceDetail {
  id: number;
  nom: string;
  slugs: string; // Slug du service lui-même
  description: string;
  prix: string; 
  image_url: string | null;
  est_disponible: boolean;
  // Ces champs devraient être retournés par votre API de détail du service
  main_category_nom?: string; 
  main_category_slugs?: string;
  sub_category_nom?: string;
  sub_category_slugs?: string;
}

// Props pour la page, incluant les paramètres de route dynamiques
interface ServiceDetailPageProps {
  params: {
    mainCatSlug: string;  // Garanti d'être présent par la structure du dossier
    subCatSlug: string;   // Garanti d'être présent
    serviceSlug: string;  // Garanti d'être présent
  };
}

const ServiceDetailPage = ({ params }: ServiceDetailPageProps) => {
  const { mainCatSlug, subCatSlug, serviceSlug } = params;
  const router = useRouter();

  const { user, isLoading: authIsLoading } = useAuth();
  const { addToCart, isCartLoading: isCartContextUpdating } = useCart(); // Utiliser isCartLoading du contexte

  const [service, setService] = useState<ServiceDetail | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true); // Renommé pour éviter conflit
  const [error, setError] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);
  const [isErrorNotification, setIsErrorNotification] = useState(false);

  useEffect(() => {
    // serviceSlug est garanti d'être présent grâce à la structure de la route
    let componentIsMounted = true;
    const fetchServiceDetail = async () => {
      setIsLoadingPage(true);
      setError(null);
      setConfirmationMessage(null);
      console.log(`ServiceDetailPage: Fetching details for service slug: ${serviceSlug}`);

      try {
        const response = await fetch(`/api/services/detail/${serviceSlug}`);
        if (!componentIsMounted) return;

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: `Service "${serviceSlug}" non trouvé ou erreur API (statut: ${response.status})` }));
          throw new Error(errorData.error || `Échec de la récupération du service`);
        }
        const data: ServiceDetail = await response.json();
        if (!componentIsMounted) return;

        console.log("ServiceDetailPage: Service data received:", data);
        setService(data);
      } catch (err: any) {
        if (componentIsMounted) {
          console.error("ServiceDetailPage: Error fetching service details:", err);
          setError(err.message);
          setService(null);
        }
      } finally {
        if (componentIsMounted) setIsLoadingPage(false);
      }
    };

    fetchServiceDetail();
    return () => { componentIsMounted = false; };

  }, [serviceSlug]); // Dépendre uniquement de serviceSlug pour ce fetch

  const handleAddToCart = () => {
    if (!service) {
      console.error("ServiceDetailPage: handleAddToCart appelé mais service est null.");
      setConfirmationMessage("Erreur: Les détails du service ne sont pas disponibles.");
      setIsErrorNotification(true);
      setTimeout(() => setConfirmationMessage(null), 3000);
      return;
    }

    // Si l'utilisateur n'est pas connecté (vérification client, mais l'API devrait aussi vérifier)
    // Le bouton ne devrait même pas être rendu si !user, mais double sécurité.
    if (!user) {
        setConfirmationMessage("Veuillez vous connecter pour ajouter au panier.");
        setIsErrorNotification(true);
        setTimeout(() => setConfirmationMessage(null), 3000);
        // Optionnel : router.push(`/connexion?redirect=${window.location.pathname}`);
        return;
    }


    const prixNumerique = typeof service.prix === 'string' ? parseFloat(service.prix) : service.prix;
    if (isNaN(prixNumerique)) {
      setConfirmationMessage("Erreur: Prix du service invalide.");
      setIsErrorNotification(true);
      setTimeout(() => setConfirmationMessage(null), 3000);
      return;
    }

    // Construire l'objet pour le contexte du panier
    const itemDataForContext: ServiceDataForCart = {
      service_id: service.id,
      nom: service.nom,
      prix_unitaire: prixNumerique,
      image_url: service.image_url || null,
      slugs: service.slugs, // Slug du service lui-même
      main_category_slugs: service.main_category_slugs || mainCatSlug, // Utiliser celui du service si disponible, sinon de l'URL
      sub_category_slugs: service.sub_category_slugs || subCatSlug,   // Utiliser celui du service si disponible, sinon de l'URL
    };
    
    console.log("ServiceDetailPage - handleAddToCart: itemDataForContext:", JSON.stringify(itemDataForContext, null, 2));

    addToCart(itemDataForContext, 1) // La fonction addToCart du contexte est async
      .then(() => {
        console.log("ServiceDetailPage: Article ajouté via contexte, promesse résolue.");
        setConfirmationMessage(`"${service.nom}" a été ajouté à votre panier !`);
        setIsErrorNotification(false);
        // Optionnel: Rediriger vers le panier
        // router.push('/panier');
      })
      .catch(error => {
        console.error("ServiceDetailPage - Erreur retournée par context.addToCart:", error);
        setConfirmationMessage("Erreur lors de l'ajout au panier. Veuillez réessayer.");
        setIsErrorNotification(true);
      })
      .finally(() => { // Cacher le message après un délai dans tous les cas
          setTimeout(() => setConfirmationMessage(null), 3000);
      });
  };

  if (authIsLoading || isLoadingPage) { 
    return <div className="bg-black text-white min-h-screen flex items-center justify-center"><div className="text-xl">Chargement du service...</div></div>; 
  }
  if (error) { 
    return <div className="bg-black text-white min-h-screen flex items-center justify-center"><div className="text-xl text-[#e30e1b]">Erreur: {error}</div></div>; 
  }
  if (!service) { 
    return <div className="bg-black text-white min-h-screen flex items-center justify-center"><div className="text-xl text-gray-400">Désolé, ce service est introuvable.</div></div>; 
  }
  if (!service.est_disponible) { /* ... (JSX pour service non disponible) ... */ }

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="container mx-auto py-8 px-4">
        {/* Message de confirmation flottant */}
        {confirmationMessage && (
          <div className={`fixed bottom-5 right-5 p-4 rounded-md shadow-lg text-white text-sm z-[100] animate-fadeInOut ${isErrorNotification ? 'bg-red-600' : 'bg-green-600'}`} role="alert">
            {confirmationMessage}
          </div>
        )}

        {/* Fil d'Ariane */}
        <nav className="mb-6 text-sm text-gray-400">
          <Link href="/services" className="hover:text-[#e30e1b]">Services</Link>
          {service.main_category_slugs && service.main_category_nom && (
            <> {' / '} <Link href={`/services/${service.main_category_slugs}`} className="hover:text-[#e30e1b]">{service.main_category_nom}</Link> </>
          )}
          {service.sub_category_slugs && service.sub_category_nom && (
            <> {' / '} <Link href={`/services/${service.main_category_slugs}/${service.sub_category_slugs}`} className="hover:text-[#e30e1b]">{service.sub_category_nom}</Link> </>
          )}
        </nav>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Colonne Image */}
          <div className="aspect-video relative rounded-lg overflow-hidden shadow-xl border border-gray-700">
            {service.image_url ? ( <Image src={service.image_url} alt={service.nom} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" priority /> ) : ( <div className="w-full h-full bg-gray-700 flex items-center justify-center"><span className="text-gray-500 text-lg">Image non disponible</span></div> )}
          </div>

          {/* Colonne Informations et Actions */}
          <div className="flex flex-col space-y-6 py-4">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">{service.nom}</h1>
            <div className="text-gray-300 prose prose-invert prose-sm lg:prose-base max-w-none leading-relaxed" dangerouslySetInnerHTML={{ __html: service.description }} />
            <p className="text-4xl font-bold text-[#e30e1b] my-4">{parseFloat(service.prix).toFixed(2)} €</p>

            <div className="space-y-3">
              {user ? (
                <Button onClick={handleAddToCart} disabled={isCartContextUpdating || !service.est_disponible} className="w-full bg-[#e30e1b] text-white font-semibold hover:bg-[#c50d18] focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#e30e1b] transition-colors duration-300 py-3 text-lg" size="lg">
                  <ShoppingCartIcon className="mr-2 h-5 w-5" />
                  {isCartContextUpdating ? "Ajout en cours..." : "Ajouter au Panier"}
                </Button>
              ) : (
                <div className="border border-dashed border-gray-600 p-4 rounded-md text-center">
                  <AlertTriangleIcon className="inline-block mr-2 h-5 w-5 text-yellow-400" />
                  <p className="text-gray-300">
                    Pour ajouter ce service, veuillez vous {" "}
                    <Link href={`/connexion?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname + window.location.search : '')}`} className="text-[#e30e1b] hover:underline font-semibold">connecter</Link>.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-gray-700 text-sm">
                <Link href={`/services/${mainCatSlug}/${subCatSlug}`} className="text-gray-400 hover:text-[#e30e1b] inline-flex items-center transition-colors">
                    <ArrowLeft size={18} className="mr-2" />
                    Retour à {service.sub_category_nom || subCatSlug}
                </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;