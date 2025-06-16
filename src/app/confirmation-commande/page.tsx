// src/app/confirmation-commande/page.tsx
"use client";

import { useEffect, useState, Suspense } from 'react'; // Ajout de Suspense
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, ShoppingBag, UserCircle, FileText } from 'lucide-react'; // Icônes

// Interfaces pour les données de la commande (correspondent à la réponse de l'API)
interface ConfirmedOrderItem {
  id: number;
  service_id: number;
  nom_service: string;
  quantite: number;
  prix_unitaire: number;
  sub_total: number;
  // service_image_url?: string | null; // Si vous l'ajoutez dans l'API
}

interface ConfirmedOrder {
  id: number;
  user_id: number | null;
  total_amount: number;
  status: string;
  client_nom: string;
  client_email: string;
  client_notes: string | null;
  created_at: string; // Date formatée en string par l'API
  items: ConfirmedOrderItem[];
}

// Composant interne pour gérer la logique et l'affichage
const ConfirmationContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderIdParam = searchParams.get('orderId');

  const [order, setOrder] = useState<ConfirmedOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderIdParam) {
      console.warn("ConfirmationPage: Pas d'orderId dans l'URL, redirection vers l'accueil.");
      router.replace('/');
      return;
    }

    const fetchOrderDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/orders/${orderIdParam}`);
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Commande ${orderIdParam} non trouvée ou erreur serveur.`);
        }
        const data: ConfirmedOrder = await response.json();
        setOrder(data);
      } catch (err: any) {
        console.error("ConfirmationPage: Erreur fetchOrderDetails:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderIdParam, router]);

  if (isLoading) {
    return <div className="text-center py-10"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e30e1b] mx-auto mb-4"></div>Chargement de votre confirmation...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Erreur: {error}</div>;
  }

  if (!order) {
    return <div className="text-center py-10 text-gray-400">Aucune information de commande à afficher.</div>;
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="container mx-auto py-12 px-4 max-w-3xl"> {/* max-w-3xl pour centrer le contenu */}
        <div className="text-center mb-10">
          <CheckCircle className="text-green-500 mx-auto mb-4" size={72} strokeWidth={1.5} />
          <h1 className="text-4xl font-bold mb-3">Merci pour votre commande, {order.client_nom} !</h1>
          <p className="text-lg text-gray-300">
            Votre commande <span className="font-semibold text-[#e30e1b]">#{order.id}</span> a été enregistrée avec succès.
          </p>
          <p className="text-gray-400 mt-1">Un récapitulatif vous a été envoyé par email à <span className="font-medium text-gray-200">{order.client_email}</span> (simulation).</p>
          <p className="text-sm text-gray-500 mt-1">Date de la commande: {order.created_at}</p>
        </div>

        <div className="bg-gray-800/50 p-6 sm:p-8 rounded-xl shadow-xl border border-gray-700 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-[#e30e1b] flex items-center"><ShoppingBag size={28} className="mr-3"/>Détails des Services</h2>
            <div className="space-y-3">
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-700/50 last:border-b-0">
                  <div>
                    <p className="font-medium text-white">{item.nom_service}</p>
                    <p className="text-sm text-gray-400">Quantité: {item.quantite}</p>
                  </div>
                  <p className="font-medium text-gray-200">{(item.prix_unitaire * item.quantite).toFixed(2)} €</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center font-bold text-xl mt-4 pt-4 border-t border-gray-600">
              <p className="text-white">Total Payé:</p>
              <p className="text-[#e30e1b]">{order.total_amount.toFixed(2)} €</p>
            </div>
          </div>

          {order.client_notes && (
            <div>
              <h2 className="text-2xl font-semibold mb-3 text-[#e30e1b] flex items-center"><FileText size={24} className="mr-3"/>Vos Notes</h2>
              <p className="text-gray-300 bg-gray-700/50 p-3 rounded-md whitespace-pre-wrap">{order.client_notes}</p>
            </div>
          )}

        </div>

        <div className="mt-12 text-center">
          <Button asChild className="bg-[#e30e1b] hover:bg-[#c50d18] text-white px-8 py-3 text-lg">
            <Link href="/">Continuer les achats</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};


// Utiliser Suspense pour gérer la lecture des searchParams côté client
const ConfirmationCommandePage = () => {
    return (
        <Suspense fallback={<div className="bg-black text-white min-h-screen flex items-center justify-center"><div className="text-xl">Chargement...</div></div>}>
            <ConfirmationContent />
        </Suspense>
    );
};


export default ConfirmationCommandePage;