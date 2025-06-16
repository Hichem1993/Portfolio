// src/contexts/CartContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext'; // Assurez-vous que ce chemin est correct

// Interface pour un article dans le panier, utilisée DANS LE CONTEXTE
// prix_unitaire est toujours un nombre ici.
export interface CartItem {
  service_id: number;
  nom: string;
  prix_unitaire: number; 
  quantite: number;
  image_url?: string | null;
  slugs?: string; 
  main_category_slugs?: string;
  sub_category_slugs?: string;
}

// Type pour les données d'un service telles qu'elles pourraient être passées depuis une page produit
// avant d'être formatées pour devenir un CartItem complet.
// Le composant appelant doit s'assurer de convertir service.prix en nombre pour prix_unitaire.
export type ServiceDataForCart = Omit<CartItem, 'quantite'>;


interface CartContextType {
  cartItems: CartItem[];
  addToCart: (serviceData: ServiceDataForCart, quantite?: number) => Promise<void>;
  removeFromCart: (serviceId: number) => Promise<void>;
  updateQuantity: (serviceId: number, quantite: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getItemCount: () => number;
  isCartLoading: boolean; // Indique si une opération affectant le panier (surtout API) est en cours
  isCartInitiallyLoaded: boolean; // Indique si le premier chargement du panier est terminé
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Changez ce nom de clé si vous voulez forcer une réinitialisation du panier local des utilisateurs
const CART_STORAGE_KEY_GUEST = 'guestCartPortfolio_v1'; 

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoading: authIsLoading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartLoading, setIsCartLoading] = useState(false); 
  const [isCartInitiallyLoaded, setIsCartInitiallyLoaded] = useState(false);

  // Fonction pour parser et valider les items du panier (depuis API ou localStorage)
  const parseAndValidateCartItems = (items: any[]): CartItem[] => {
    if (!Array.isArray(items)) return [];
    return items
      .map(item => ({
        service_id: Number(item.service_id),
        nom: String(item.nom || 'Service sans nom'),
        prix_unitaire: Number(item.prix_unitaire) || 0,
        quantite: Number(item.quantite) || 1,
        image_url: item.image_url || null,
        slugs: item.slugs || undefined,
        main_category_slugs: item.main_category_slugs || undefined,
        sub_category_slugs: item.sub_category_slugs || undefined,
      }))
      .filter(item => item.service_id && item.nom && item.quantite > 0 && !isNaN(item.prix_unitaire));
  };

  // Charger le panier initialement
  const loadCart = useCallback(async () => {
    // Attendre que l'état d'authentification soit résolu avant de charger le panier
    if (authIsLoading) { 
      console.log("CartContext: Auth en cours de chargement, attente pour loadCart.");
      // Ne pas mettre isLoading à false ici, car on attend toujours
      return;
    }

    console.log("CartContext: Début de loadCart. Utilisateur:", user ? `ID ${user.id}` : "Invité", "Auth chargé:", !authIsLoading);
    setIsCartLoading(true); // Ce isLoading est pour l'opération de chargement du panier
    
    if (user) { // Utilisateur connecté
      try {
        const response = await fetch('/api/cart'); // API GET pour récupérer le panier
        if (response.ok) {
          const data: any[] = await response.json();
          const parsedData = parseAndValidateCartItems(data);
          setCartItems(parsedData);
          localStorage.removeItem(CART_STORAGE_KEY_GUEST); // Nettoyer le panier invité
          console.log("CartContext: Panier API chargé pour l'utilisateur.", parsedData);
        } else {
          const errorText = await response.text().catch(() => "Impossible de lire la réponse d'erreur.");
          console.error(`CartContext: Erreur API (${response.status}) chargement panier user. Réponse: ${errorText}`);
          setCartItems([]); // Erreur API, panier vide
        }
      } catch (error) {
        console.error("CartContext: Erreur fetch chargement panier user:", error);
        setCartItems([]); // Erreur fetch, panier vide
      }
    } else { // Utilisateur invité
      console.log("CartContext: Utilisateur non connecté. Chargement du panier invité depuis localStorage.");
      const storedCart = localStorage.getItem(CART_STORAGE_KEY_GUEST);
      if (storedCart) {
        try { 
          const parsed = JSON.parse(storedCart);
          setCartItems(parseAndValidateCartItems(parsed));
        } catch (e) { 
            console.error("CartContext: Erreur parsing panier invité localStorage:", e); 
            setCartItems([]); 
            localStorage.removeItem(CART_STORAGE_KEY_GUEST); 
        }
      } else {
        setCartItems([]); // Aucun panier local trouvé
      }
    }
    setIsCartLoading(false); 
    if(!isCartInitiallyLoaded) setIsCartInitiallyLoaded(true); // Marquer le chargement initial comme terminé
    console.log("CartContext: Fin de loadCart. isCartLoading:", false, "isCartInitiallyLoaded:", isCartInitiallyLoaded, "Nb items:", cartItems.reduce((sum, item) => sum + item.quantite, 0));
  }, [user, authIsLoading, isCartInitiallyLoaded]); // isCartInitiallyLoaded est une dépendance pour s'assurer qu'on ne le remet pas à false prématurément.

  // Appeler loadCart une fois que l'état d'authentification est connu, et si l'utilisateur change.
  useEffect(() => {
    console.log("CartContext: useEffect pour loadCart. authIsLoading:", authIsLoading);
    if(!authIsLoading){ // Charger seulement quand l'état d'auth est résolu
        loadCart();
    }
  }, [authIsLoading, user, loadCart]); // `loadCart` est mémoïsé avec useCallback

  // Sauvegarder le panier dans localStorage pour les invités UNIQUEMENT si le chargement initial est fait
  useEffect(() => {
    if (!user && isCartInitiallyLoaded) { // Ne sauvegarder que si le panier a été chargé au moins une fois
      console.log("CartContext: Sauvegarde du panier invité dans localStorage:", cartItems);
      localStorage.setItem(CART_STORAGE_KEY_GUEST, JSON.stringify(cartItems));
    }
  }, [cartItems, user, isCartInitiallyLoaded]); // Se redéclenche quand cartItems change (pour un invité)


  // Fonction centralisée pour les appels API modifiant le panier
  const syncCartWithApi = useCallback(async (url: string, method: string, body?: any): Promise<boolean> => {
    if (!user) { console.warn("CartContext: syncCartWithApi appelé sans utilisateur connecté."); return false; }
    
    console.log(`CartContext: syncCartWithApi DÉBUT. URL: ${url}, Method: ${method}, Body:`, JSON.stringify(body));
    setIsCartLoading(true);
    try {
      const options: RequestInit = { method };
      if (body) { options.headers = { 'Content-Type': 'application/json' }; options.body = JSON.stringify(body); }
      
      const response = await fetch(url, options);
      const responseBodyText = await response.text(); // Lire le corps une fois pour le log et le parsing
      console.log(`CartContext: syncCartWithApi - Réponse API brute pour ${method} ${url}: Statut ${response.status}, Corps: ${responseBodyText}`);

      if (!response.ok) {
        let errorData; 
        try { errorData = JSON.parse(responseBodyText); } catch { errorData = {error: "Réponse d'erreur API non JSON: " + responseBodyText}; }
        console.error(`CartContext: syncCartWithApi ERREUR API: ${method} ${url}`, errorData);
        alert(`Erreur panier: ${errorData.error || 'Opération sur le panier échouée.'}`);
        return false;
      }
      
      const updatedApiCart: any[] = JSON.parse(responseBodyText);
      console.log("CartContext: syncCartWithApi - Données parsées de l'API:", updatedApiCart);
      
      const parsedApiCart = parseAndValidateCartItems(updatedApiCart);
      console.log("CartContext: syncCartWithApi - Données après parsing interne:", parsedApiCart);
      
      setCartItems(parsedApiCart); // Mettre à jour l'état avec la réponse complète et validée de l'API
      console.log(`CartContext: syncCartWithApi - Panier ÉTAT MIS À JOUR avec la réponse de l'API.`);
      return true;
    } catch (error: any) { 
      console.error(`CartContext: syncCartWithApi ERREUR FETCH pour ${method} ${url}`, error); 
      alert("Une erreur de communication est survenue lors de l'opération sur le panier.");
      return false; 
    } finally {
      setIsCartLoading(false);
      console.log(`CartContext: syncCartWithApi FIN. isCartLoading: false`);
    }
  }, [user]); // `user` est la dépendance clé ici

  const addToCart = useCallback(async (
    serviceData: ServiceDataForCart, // serviceData.prix_unitaire est déjà un nombre
    quantiteToAdd: number = 1
  ) => {
    if (quantiteToAdd <= 0) return;
    console.log("CartContext: addToCart déclenché. User:", user ? `ID ${user.id}` : "Invité", "Service ID:", serviceData.service_id, "Qté:", quantiteToAdd, "Prix unitaire:", serviceData.prix_unitaire);
    
    if (user) {
      await syncCartWithApi('/api/cart', 'POST', { // Utilise POST sur /api/cart
        service_id: serviceData.service_id, 
        quantite: quantiteToAdd,
        prix_unitaire: serviceData.prix_unitaire, // Déjà un nombre
        // L'API POST /api/cart peut avoir besoin d'autres champs pour créer/trouver l'item si nécessaire
        // mais pour l'instant, on se base sur service_id, quantite, prix_unitaire.
        nom: serviceData.nom, // Optionnel, mais bon à avoir pour la création initiale en BDD si l'API le gère
        image_url: serviceData.image_url,
        slugs: serviceData.slugs,
        main_category_slugs: serviceData.main_category_slugs,
        sub_category_slugs: serviceData.sub_category_slugs,
      });
    } else { 
      setIsCartLoading(true);
      setCartItems(prevItems => {
        const existingItemIndex = prevItems.findIndex(item => item.service_id === serviceData.service_id);
        let newCart: CartItem[];
        if (existingItemIndex > -1) {
          newCart = prevItems.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantite: item.quantite + quantiteToAdd, prix_unitaire: serviceData.prix_unitaire } // Mettre à jour le prix aussi si besoin
              : item
          );
        } else {
          newCart = [...prevItems, { ...serviceData, quantite: quantiteToAdd }];
        }
        console.log("CartContext addToCart (Invité): Nouveau panier local (sera sauvegardé par useEffect):", newCart);
        return newCart;
      });
      setIsCartLoading(false);
    }
  }, [user, syncCartWithApi]);

  const removeFromCart = useCallback(async (serviceId: number) => {
    console.log("CartContext: removeFromCart pour serviceId:", serviceId, "User:", user ? user.id : "Invité");
    if (user) { await syncCartWithApi(`/api/cart/item/${serviceId}`, 'DELETE'); }
    else { setIsCartLoading(true); setCartItems(prev => prev.filter(item => item.service_id !== serviceId)); setIsCartLoading(false); }
  }, [user, syncCartWithApi]);

  const updateQuantity = useCallback(async (serviceId: number, quantite: number) => {
    console.log("CartContext: updateQuantity pour serviceId:", serviceId, "Qté:", quantite, "User:", user ? user.id : "Invité");
    if (quantite <= 0) { await removeFromCart(serviceId); return; } // Utiliser la version `async`
    if (user) { await syncCartWithApi(`/api/cart/item/${serviceId}`, 'PUT', { quantite }); }
    else { setIsCartLoading(true); setCartItems(prev => prev.map(item => item.service_id === serviceId ? { ...item, quantite } : item)); setIsCartLoading(false); }
  }, [user, syncCartWithApi, removeFromCart]);

  const clearCart = useCallback(async () => {
    console.log("CartContext: clearCart. User:", user ? user.id : "Invité");
    if (user) { await syncCartWithApi('/api/cart', 'DELETE'); } // API DELETE sur /api/cart pour vider
    else { setIsCartLoading(true); setCartItems([]); setIsCartLoading(false); }
  }, [user, syncCartWithApi]);

  const getCartTotal = useCallback((): number => cartItems.reduce((total, item) => total + item.prix_unitaire * item.quantite, 0), [cartItems]);
  const getItemCount = useCallback((): number => cartItems.reduce((count, item) => count + item.quantite, 0), [cartItems]);

  return (
    <CartContext.Provider value={{ 
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getItemCount, 
      isCartLoading, isCartInitiallyLoaded
    }}>
      {/* Afficher un loader global si l'auth n'est pas prête OU si le panier initial charge */}
      {(authIsLoading || (isCartLoading && !isCartInitiallyLoaded)) && ( 
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]" aria-live="assertive" role="status">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e30e1b]"></div>
              <span className="sr-only">Chargement...</span>
          </div>
      )}
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) { throw new Error('useCart must be used within a CartProvider'); }
  return context;
};