// src/app/profil/page.tsx
"use client"; 

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useAuth, User as AuthUserInterface } from '@/contexts/AuthContext'; // Importer User de AuthContext pour le type
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, ShoppingBag, FileText } from 'lucide-react'; // Icônes pour l'UI

// Interface pour un article de commande (côté client)
interface OrderItem {
  id: number;
  service_id: number;
  nom_service: string;
  quantite: number;
  prix_unitaire: number; // Attendu comme nombre
  sub_total: number;     // Attendu comme nombre
}

// Interface pour une commande utilisateur (côté client)
interface UserOrder {
  id: number;
  total_amount: number; // Attendu comme nombre
  status: string;
  created_at: string; // Date déjà formatée par l'API
  items: OrderItem[];
  client_nom: string;
  client_email: string;
  client_notes?: string | null; // Rendre client_notes optionnel
}

const ProfilePage = () => {
  const { user, login: updateUserInContext, isLoading: authIsLoading } = useAuth(); 
  
  const [formData, setFormData] = useState({ nom: '', prenom: '', email: '' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Pré-remplir le formulaire de profil avec les données de l'utilisateur connecté
  useEffect(() => {
    if (user) {
      setFormData({ nom: user.nom || '', prenom: user.prenom || '', email: user.email || '' });
    }
  }, [user]);

  // Charger l'historique des commandes de l'utilisateur
  useEffect(() => {
    // Ne pas exécuter si l'état d'authentification est encore en chargement ou si l'utilisateur n'est pas défini
    if (authIsLoading || !user || !user.id) { 
      // Si auth est chargée et pas d'user, ou pas d'user.id, on ne peut pas fetcher les commandes.
      if (!authIsLoading && !user) {
        setIsLoadingOrders(false); // Arrêter le chargement si on sait qu'il n'y a pas d'utilisateur
        setOrdersError("Utilisateur non connecté pour afficher les commandes."); // Message optionnel
      }
      return;
    }

    const fetchUserOrders = async () => {
      console.log("ProfilePage: Tentative de chargement des commandes pour l'utilisateur ID:", user.id);
      setIsLoadingOrders(true);
      setOrdersError(null);
      try {
        const requestHeaders: HeadersInit = new Headers();
        // Envoyer l'ID de l'utilisateur dans un header personnalisé.
        // ATTENTION: Ce n'est pas sécurisé pour la production sans un vrai système de token.
        requestHeaders.set('X-User-ID', user.id.toString()); 
        console.log("ProfilePage: fetchUserOrders - Envoi du header X-User-ID:", user.id.toString());

        const response = await fetch('/api/orders/user', { headers: requestHeaders }); 
        
        if (!response.ok) {
          const errData = await response.json().catch(() => ({ error: `Erreur API (${response.status}), réponse non JSON` }));
          console.error("ProfilePage: Erreur API fetchUserOrders:", errData.error || response.statusText, "Statut:", response.status);
          // Le message d'erreur affiché sera celui retourné par l'API, ou un message par défaut.
          throw new Error(errData.error || "Impossible de charger l'historique des commandes.");
        }
        const data: UserOrder[] = await response.json();
        console.log("ProfilePage: Commandes utilisateur reçues:", data);
        setOrders(data);
      } catch (err: any) {
        console.error("ProfilePage: Exception dans fetchUserOrders:", err);
        setOrdersError(err.message); // Définir l'erreur pour l'afficher à l'utilisateur
        setOrders([]); // S'assurer que orders est un tableau vide en cas d'erreur
      } finally {
        setIsLoadingOrders(false); // Arrêter l'indicateur de chargement
      }
    };
    fetchUserOrders();
  }, [user, authIsLoading]); // Se redéclenche si l'objet `user` ou `authIsLoading` change.

  const handleProfileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingProfile(true); setProfileMessage(null); setProfileError(null);
    console.log("ProfilePage: Soumission du formulaire de profil avec données:", formData);
    try {
      const requestHeaders: HeadersInit = new Headers({ 'Content-Type': 'application/json' });
      if (user?.id) { requestHeaders.set('X-User-ID', user.id.toString()); } 
      else { throw new Error("Utilisateur non identifié pour la mise à jour du profil."); }

      const response = await fetch('/api/users/profile', { // Chemin API pour la mise à jour du profil
        method: 'PUT',
        headers: requestHeaders,
        body: JSON.stringify({ nom: formData.nom, prenom: formData.prenom }),
      });
      const result = await response.json();
      if (!response.ok) { throw new Error(result.error || "Erreur MàJ profil."); }
      setProfileMessage("Profil mis à jour !");
      if (result.user) { updateUserInContext(result.user as AuthUserInterface); } // S'assurer du type
      setIsEditingProfile(false);
    } catch (err: any) { setProfileError(err.message); }
    finally { setIsSubmittingProfile(false); }
  };

  // Affichage pendant le chargement de l'authentification. ProtectedRoute gère aussi la redirection.
  if (authIsLoading) { 
    return ( <div className="bg-black text-white min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e30e1b]"></div></div> );
  }
  // Si, après le chargement de l'auth, il n'y a toujours pas d'utilisateur (ProtectedRoute devrait rediriger, mais sécurité)
  if (!user) {
    return <div className="bg-black text-white min-h-screen flex items-center justify-center"><p>Veuillez vous <Link href="/connexion" className="text-[#e30e1b] hover:underline">connecter</Link> pour voir votre profil.</p></div>;
  }

  return (
    <ProtectedRoute>
      <div className="bg-black text-white min-h-screen">
        <div className="container mx-auto py-10 px-4">
          <h1 className="text-3xl sm:text-4xl font-bold mb-10 border-b border-gray-700 pb-4 text-center">Mon Profil</h1>

          {/* Section Informations Personnelles */}
          <section className="mb-12 bg-gray-800/50 p-6 sm:p-8 rounded-lg border border-gray-700 shadow-xl">
            {/* ... JSX pour afficher/modifier le profil (comme dans votre version précédente) ... */}
            <div className="flex justify-between items-center mb-6"> <h2 className="text-2xl font-semibold text-[#e30e1b]">Mes Informations</h2> <Button variant="outline" onClick={() => { setIsEditingProfile(!isEditingProfile); setProfileMessage(null); setProfileError(null); if (!isEditingProfile && user) { setFormData({ nom: user.nom || '', prenom: user.prenom || '', email: user.email }); } }} className="text-sm border-gray-500 text-gray-200 hover:bg-gray-700 hover:border-gray-400 focus:ring-2 focus:ring-[#e30e1b]">{isEditingProfile ? "Annuler" : "Modifier le profil"}</Button> </div>
            {profileMessage && <p className="mb-4 text-sm p-3 rounded-md bg-green-500/20 text-green-400 border border-green-500/30">{profileMessage}</p>}
            {profileError && <p className="mb-4 text-sm p-3 rounded-md bg-red-500/20 text-red-400 border border-red-500/30">{profileError}</p>}
            {!isEditingProfile ? ( <div className="space-y-3 text-gray-300"> <div className="flex flex-col sm:flex-row sm:items-center"><span className="font-semibold text-gray-100 w-28 shrink-0">Prénom:</span><span>{user.prenom || 'N/A'}</span></div> <div className="flex flex-col sm:flex-row sm:items-center"><span className="font-semibold text-gray-100 w-28 shrink-0">Nom:</span> <span>{user.nom || 'N/A'}</span></div> <div className="flex flex-col sm:flex-row sm:items-center"><span className="font-semibold text-gray-100 w-28 shrink-0">Email:</span> <span>{user.email}</span></div> <div className="flex flex-col sm:flex-row sm:items-center"><span className="font-semibold text-gray-100 w-28 shrink-0">Rôle:</span> <span className={`px-2 py-0.5 text-xs rounded-full ${user.role === 'Admin' ? 'bg-red-700 text-red-100' : 'bg-blue-700 text-blue-100'}`}>{user.role}</span></div> </div> ) 
            : ( <form onSubmit={handleProfileSubmit} className="space-y-6"> <div> <Label htmlFor="prenom">Prénom</Label> <Input type="text" name="prenom" id="prenom" value={formData.prenom} onChange={handleProfileInputChange} /> </div> <div> <Label htmlFor="nom">Nom</Label> <Input type="text" name="nom" id="nom" value={formData.nom} onChange={handleProfileInputChange} /> </div> <div> <Label htmlFor="email_display">Email (non modifiable)</Label> <Input type="email" name="email_display" id="email_display" value={formData.email} readOnly disabled /> </div> <Button type="submit" disabled={isSubmittingProfile}>{isSubmittingProfile ? "Enregistrement..." : "Enregistrer"}</Button> </form> )}
          </section>

          {/* Section Historique des Commandes */}
          <section className="bg-gray-800/50 p-6 sm:p-8 rounded-lg border border-gray-700 shadow-xl">
            <h2 className="text-2xl font-semibold mb-6 text-[#e30e1b]">Mes Commandes</h2>
            {isLoadingOrders ? ( <div className="text-center text-gray-400 py-4">Chargement de vos commandes...</div> ) 
            : ordersError ? ( <p className="text-red-400 bg-red-500/10 p-3 rounded-md">{ordersError}</p> ) 
            : orders.length === 0 ? ( <p className="text-gray-400">Vous n'avez aucune commande pour le moment.</p> ) 
            : ( <Accordion type="single" collapsible className="w-full space-y-3"> {orders.map(order => ( <AccordionItem key={order.id} value={`order-${order.id}`} className="bg-gray-700/40 border border-gray-600 rounded-lg overflow-hidden"> <AccordionTrigger className="hover:no-underline px-4 sm:px-6 py-3 text-md sm:text-lg text-left hover:bg-gray-700/60"> <div className="flex justify-between w-full items-center"> <span className="font-medium text-gray-100">Commande #{order.id}</span> <div className="flex flex-col sm:flex-row items-end sm:items-center gap-x-3 gap-y-1"><span className="text-xs sm:text-sm text-gray-400">{order.created_at}</span><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${order.status === 'completed' || order.status === 'paid' ? 'bg-green-600 text-green-100' : 'bg-yellow-600 text-yellow-100'}`}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></div> </div> </AccordionTrigger> <AccordionContent className="px-4 sm:px-6 pb-4 pt-2 bg-gray-700/20"> <ul className="space-y-2 mb-3"> {order.items.map(item => ( <li key={item.id} className="flex justify-between items-center text-sm py-1.5 border-b border-gray-600/50 last:border-b-0"><span className="text-gray-200">{item.nom_service} (Qté: {item.quantite})</span><span className="text-gray-300">{(item.prix_unitaire * item.quantite).toFixed(2)} €</span></li> ))} </ul> <p className="text-right font-bold text-md text-white mt-3">Total: <span className="text-[#e30e1b]">{order.total_amount.toFixed(2)} €</span></p> </AccordionContent> </AccordionItem> ))} </Accordion> )}
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ProfilePage;