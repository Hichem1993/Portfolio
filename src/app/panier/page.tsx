// src/app/panier/page.tsx
"use client";

import { useCart, CartItem } from "@/contexts/CartContext"; // Assurez-vous que CartItem est exporté si vous l'utilisez ici
import { useAuth } from "@/contexts/AuthContext";     // Pour obtenir les infos de l'utilisateur connecté
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Trash2, MinusSquare, PlusSquare, ShoppingCart as ShoppingCartIcon } from "lucide-react";
import { useRouter } from "next/navigation";      // Pour la redirection après commande
import { useState, useEffect } from "react";      // Pour l'état de traitement

const PanierPage = () => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal, 
    getItemCount, 
    isCartLoading, 
    isCartInitiallyLoaded 
  } = useCart();
  
  const { user } = useAuth(); // Récupérer l'utilisateur pour pré-remplir/valider
  const router = useRouter();
  const [isProcessingOrder, setIsProcessingOrder] = useState(false); // État pour le traitement de la commande
  const [checkoutError, setCheckoutError] = useState<string | null>(null);


  // Fonction pour gérer la soumission/validation de la commande
  const handleValidateOrder = async () => {
    if (getItemCount() === 0) {
      alert("Votre panier est vide.");
      return;
    }
    // S'assurer que l'utilisateur est connecté pour passer une commande
    if (!user) {
        alert("Veuillez vous connecter pour valider votre commande.");
        router.push(`/connexion?redirect=/panier`); // Rediriger vers connexion puis retour au panier
        return;
    }

    setIsProcessingOrder(true);
    setCheckoutError(null);

    // S'assurer que prix_unitaire est un nombre pour chaque item avant l'envoi
    const cartItemsWithNumericPrice: CartItem[] = cartItems.map(item => ({
        ...item,
        prix_unitaire: Number(item.prix_unitaire) 
    }));

    const orderData = {
      cartItems: cartItemsWithNumericPrice,
      totalAmount: getCartTotal(),
      clientInfo: { // Utiliser les infos de l'utilisateur connecté
        nom: `${user.prenom || ''} ${user.nom || ''}`.trim() || "Client Non Spécifié",
        email: user.email, // L'email est généralement requis
        notes: "" // Laisser vide pour l'instant, pourrait venir d'un champ de formulaire
      },
      userId: user.id // ID de l'utilisateur connecté
    };

    console.log("PanierPage: Tentative de création de commande avec données:", orderData);

    try {
      const response = await fetch('/api/orders', { // Appel à l'API de création de commande
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("PanierPage: Erreur API lors de la création de commande:", result);
        throw new Error(result.error || 'Erreur lors de la création de la commande.');
      }
      
      if (result.success && result.orderId) {
        console.log("PanierPage: Commande créée avec succès par l'API, ID:", result.orderId);
        await clearCart(); // Vider le panier du contexte (localStorage/API)
        console.log("PanierPage: Panier vidé côté client, redirection vers confirmation.");
        router.push(`/confirmation-commande?orderId=${result.orderId}`); 
      } else {
        console.error("PanierPage: Réponse API succès mais données manquantes:", result);
        setCheckoutError(result.error || "Erreur inattendue après la tentative de création de commande.");
      }
    } catch (err: any) {
      console.error("PanierPage: Erreur lors de la soumission de la commande:", err);
      setCheckoutError(err.message);
    } finally {
      setIsProcessingOrder(false);
    }
  };

  // Loader initial
  if (!isCartInitiallyLoaded) {
    return (
      <div className="bg-black text-white min-h-[calc(100vh-var(--navbar-height,4rem))] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e30e1b] mb-4"></div>
          <p className="text-xl">Chargement du panier...</p>
        </div>
      </div>
    );
  }

  // Panier vide
  if (cartItems.length === 0) {
    return (
      <div className="bg-black text-white min-h-[calc(100vh-var(--navbar-height,4rem))]">
        <div className="container mx-auto py-20 text-center flex flex-col items-center justify-center h-full">
          <ShoppingCartIcon size={64} className="mx-auto mb-6 text-gray-500" strokeWidth={1.5}/>
          <h1 className="text-3xl font-bold mb-4">Votre panier est vide</h1>
          <p className="text-gray-400 mb-8">Il est temps de trouver des services qui vous inspirent !</p>
          <Button asChild className="bg-[#e30e1b] text-white hover:bg-[#c50d18] px-8 py-3 text-lg">
            <Link href="/services">Découvrir nos services</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Panier avec articles
  return (
    <div className="bg-black text-white min-h-screen">
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 border-b border-gray-700 pb-4">
          Votre Panier 
          <span className="text-lg text-gray-400 ml-2">
            ({getItemCount()} article{getItemCount() > 1 ? 's' : ''})
          </span>
        </h1>
        
        <div className="space-y-6 mb-10">
          {cartItems.map((item) => (
            <div key={item.service_id} className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gray-800/60 rounded-lg border border-gray-700 shadow-md">
              <div className="w-24 h-24 sm:w-28 sm:h-28 relative rounded overflow-hidden shrink-0 bg-gray-700">
                {item.image_url ? (<Image src={item.image_url} alt={item.nom} fill className="object-cover" sizes="112px" />) : (<div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">Pas d'image</div>)}
              </div>
              <div className="flex-grow text-center sm:text-left">
                <h2 className="text-lg sm:text-xl font-semibold text-white hover:text-[#e30e1b] transition-colors">
                  <Link href={item.main_category_slugs && item.sub_category_slugs && item.slugs ? `/services/${item.main_category_slugs}/${item.sub_category_slugs}/${item.slugs}` : '/services'}>{item.nom}</Link>
                </h2>
                <p className="text-md text-gray-400 mt-1">Prix unitaire: {(item.prix_unitaire).toFixed(2)} €</p>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 my-2 sm:my-0">
                <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.service_id, item.quantite - 1)} disabled={isCartLoading || item.quantite <= 1} className="text-gray-400 hover:text-white disabled:opacity-40 h-8 w-8 sm:h-9 sm:w-9" aria-label="Réduire la quantité"><MinusSquare size={18} strokeWidth={1.5}/></Button>
                <span className="text-lg w-8 text-center font-medium">{item.quantite}</span>
                <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.service_id, item.quantite + 1)} disabled={isCartLoading} className="text-gray-400 hover:text-white h-8 w-8 sm:h-9 sm:w-9" aria-label="Augmenter la quantité"><PlusSquare size={18} strokeWidth={1.5}/></Button>
              </div>
              <div className="text-lg sm:text-xl font-semibold w-28 text-center sm:text-right shrink-0 text-[#e30e1b]">{(item.prix_unitaire * item.quantite).toFixed(2)} €</div>
              <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.service_id)} disabled={isCartLoading} className="text-red-500 hover:text-red-400 shrink-0 h-8 w-8 sm:h-9 sm:w-9" aria-label="Supprimer l'article"><Trash2 size={18} strokeWidth={1.5}/></Button>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-6">
          <Button variant="outline" onClick={clearCart} disabled={isCartLoading || cartItems.length === 0 || isProcessingOrder} className="border-red-600 text-red-500 hover:bg-red-600/10 hover:text-red-400 order-2 sm:order-1 w-full sm:w-auto">
            {isCartLoading ? 'Action en cours...' : 'Vider le panier'}
          </Button>
          <div className="text-right order-1 sm:order-2 w-full sm:w-auto">
            <p className="text-2xl font-bold mb-1">Total du Panier:</p>
            <p className="text-3xl font-extrabold text-[#e30e1b] mb-4">{getCartTotal().toFixed(2)} €</p>
            
            {checkoutError && <p className="text-sm text-red-500 mb-2 text-center sm:text-right">Erreur: {checkoutError}</p>}
            
            <Button 
              onClick={handleValidateOrder} // Appelle la fonction pour créer la commande
              size="lg" 
              className="w-full bg-[#e30e1b] hover:bg-[#c50d18] text-white font-semibold py-3 text-lg" 
              disabled={isCartLoading || cartItems.length === 0 || isProcessingOrder || (!user && !authIsLoading)} // Désactiver si pas connecté et que l'état d'auth est chargé
            >
              {isProcessingOrder ? 'Traitement...' : (user ? 'Valider la Commande' : 'Connectez-vous pour Valider')}
            </Button>
            {!user && !authIsLoading && ( // Afficher seulement si l'état d'auth est résolu et qu'il n'y a pas d'utilisateur
                <p className="text-xs text-gray-400 mt-2 text-center sm:text-right">
                    Vous devez être <Link href={`/connexion?redirect=/panier`} className="underline hover:text-[#e30e1b]">connecté</Link> pour valider.
                </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanierPage;