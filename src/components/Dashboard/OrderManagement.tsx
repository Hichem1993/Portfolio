// src/components/Dashboard/OrderManagement.tsx
"use client";

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Button } from "@/components/ui/button"; // Si vous ajoutez des actions plus tard
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Eye, User, Mail, Info, DollarSign, Hash, CalendarDays, ListChecks } from 'lucide-react'; // Icônes pour les détails
import { cn } from '@/lib/utils';

// Interface pour correspondre à la réponse de l'API /api/orders/admin
interface OrderItemAdmin {
  id: number;
  service_id: number;
  nom_service: string;
  quantite: number;
  prix_unitaire: string; // Déjà formaté en string par l'API
  sub_total: string;     // Idem
}
interface OrderAdmin {
  order_id: number;
  user_id: number | null;
  total_amount: string; // Déjà formaté
  status: string;
  client_nom_commande: string;
  client_email_commande: string;
  user_nom: string | null;
  user_prenom: string | null;
  user_email: string | null;
  order_created_at: string; // Date déjà formatée
  items: OrderItemAdmin[];
}

const OrderManagement = () => {
  const [orders, setOrders] = useState<OrderAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true); setError(null);
    try {
      const response = await fetch('/api/orders/admin'); // Appel à la nouvelle API
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Échec de la récupération des commandes');
      }
      const data: OrderAdmin[] = await response.json();
      console.log("OrderManagement: Commandes reçues:", data);
      setOrders(data);
    } catch (err: any) { 
        console.error("OrderManagement: Erreur dans fetchOrders:", err);
        setError(err.message); 
        setOrders([]);
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  if (isLoading) {
    return <div className="text-center py-10 text-white"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#e30e1b] mx-auto mb-3"></div>Chargement des commandes...</div>;
  }
  if (error) {
    return <div className="text-center text-[#e30e1b] py-10 bg-red-900/20 p-4 rounded-md">Erreur: {error}</div>;
  }

  return (
    <div className="bg-gray-800/30 p-4 md:p-6 rounded-lg border border-gray-700/50 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Gestion des Commandes</h1>
        {/* Optionnel: Bouton pour filtrer ou exporter les commandes */}
      </div>

      {orders.length === 0 && !isLoading ? (
        <p className="text-center text-gray-400 py-10">Aucune commande trouvée pour le moment.</p>
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-3">
          {orders.map((order) => (
            <AccordionItem key={order.order_id} value={`order-${order.order_id}`} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-[#e30e1b]/50 transition-all">
              <AccordionTrigger className="hover:no-underline px-4 sm:px-6 py-4 text-left data-[state=open]:bg-gray-700/50 hover:bg-gray-700/30 transition-colors">
                <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-2 text-gray-100">
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-lg text-white truncate">Commande #{order.order_id}</span>
                    <p className="text-xs text-gray-400 mt-0.5 truncate" title={order.client_email_commande}>
                      Client: {order.client_nom_commande}
                    </p>
                  </div>
                  <div className="text-right mt-2 sm:mt-0 shrink-0">
                    <p className="text-sm text-gray-300">{order.order_created_at}</p>
                    <span className={cn(
                        "text-xs font-semibold px-2.5 py-1 rounded-full mt-1 inline-block",
                        order.status === 'paid' || order.status === 'completed' ? 'bg-green-500/80 text-green-50' : 
                        order.status === 'pending' ? 'bg-yellow-500/80 text-yellow-50' :
                        order.status === 'processing' ? 'bg-blue-500/80 text-blue-50' :
                        'bg-red-500/80 text-red-50' // cancelled or other
                    )}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 sm:px-6 pb-4 pt-3 bg-gray-700/20 border-t border-gray-700/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm mb-4">
                    <div><User className="inline h-4 w-4 mr-1.5 text-gray-400"/>Compte Client: {order.user_id ? `${order.user_prenom || ''} ${order.user_nom || ''} (ID: ${order.user_id})` : <span className="italic text-gray-500">Invité</span>}</div>
                    <div><Mail className="inline h-4 w-4 mr-1.5 text-gray-400"/>Email Client: {order.client_email_commande}</div>
                    <div><DollarSign className="inline h-4 w-4 mr-1.5 text-gray-400"/>Montant Total: <span className="font-semibold text-[#e30e1b]">{order.total_amount} €</span></div>
                    <div><ListChecks className="inline h-4 w-4 mr-1.5 text-gray-400"/>Statut: {order.status}</div>
                </div>

                <h4 className="text-md font-semibold text-gray-200 mb-2 mt-3 border-t border-gray-600/50 pt-3">Articles Commandés:</h4>
                <ul className="space-y-1.5">
                  {order.items.map(item => (
                    <li key={item.id} className="flex justify-between items-center text-sm py-1">
                      <span className="text-gray-300 flex-1 min-w-0 pr-2">
                        {item.nom_service} 
                        <span className="text-gray-500 text-xs"> (Qté: {item.quantite})</span>
                      </span>
                      <span className="text-gray-300 shrink-0">{item.sub_total} €</span>
                    </li>
                  ))}
                </ul>
                {order.client_notes && (
                    <div className="mt-4 pt-3 border-t border-gray-600/50">
                        <p className="text-sm font-semibold text-gray-200 mb-1 flex items-center"><Info size={16} className="mr-2 text-blue-400"/>Notes du client :</p>
                        <p className="text-xs text-gray-400 bg-gray-700/40 p-2 rounded whitespace-pre-wrap">{order.client_notes}</p>
                    </div>
                )}
                {/* TODO: Actions spécifiques à la commande (ex: changer statut) */}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default OrderManagement;