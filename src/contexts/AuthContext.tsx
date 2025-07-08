// src/contexts/AuthContext.tsx // Assurez-vous que ce chemin est celui utilisé dans vos imports

"use client"; // Indique que ce composant est côté client (Next.js 13+)

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation'; // Hook pour la navigation côté client dans Next.js

// Interface décrivant la forme de l'objet utilisateur
interface User {
  id: number;
  email: string;
  nom?: string;      // Propriété optionnelle
  prenom?: string;   // Propriété optionnelle
  role: string;      // Par exemple "Admin", "User", etc.
}

// Interface décrivant ce que fournit le contexte d'authentification
interface AuthContextType {
  user: User | null;               // L'utilisateur connecté ou null si pas connecté
  login: (userData: User) => void; // Fonction pour connecter un utilisateur
  logout: () => void;              // Fonction pour déconnecter l'utilisateur
  isLoading: boolean;              // Indique si l'authentification est en cours (ex: récupération locale)
  isAdmin: () => boolean;          // Fonction pour vérifier si l'utilisateur est admin
}

// 1. Création du Contexte React, avec valeur par défaut undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Création du Provider (composant qui enveloppe l'app et fournit le contexte)
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);       // Stocke l'utilisateur connecté
  const [isLoading, setIsLoading] = useState(true);          // Indique si on est en train de récupérer l'user
  const router = useRouter();                                // Hook Next.js pour rediriger l'utilisateur

  useEffect(() => {
    // Au premier rendu, on essaye de récupérer l'utilisateur dans le localStorage
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        // Si trouvé, on parse le JSON et on met à jour l'état
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      // En cas d'erreur (ex: JSON invalide), on log l'erreur et on supprime l'item corrompu
      console.error("AuthProvider: Failed to parse user from localStorage", error);
      localStorage.removeItem('user');
    }
    setIsLoading(false); // On indique que la récupération initiale est terminée
  }, []); // [] signifie que cet effet ne se lance qu'une seule fois au montage du composant

  // Fonction pour connecter un utilisateur : on met à jour l'état et on sauvegarde dans localStorage
  const login = (userData: User) => {
    setUser(userData);
    try {
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error("AuthProvider: Failed to save user to localStorage", error);
    }
  };

  // Fonction pour déconnecter l'utilisateur : on supprime l'état et localStorage puis on redirige
  const logout = async () => {
    setUser(null);
    try {
      localStorage.removeItem('user');
    } catch (error) {
      console.error("AuthProvider: Failed during logout process", error);
    }
    router.push('/'); // Redirection vers la page d'accueil ou page de login
  };

  // Fonction qui retourne vrai si l'utilisateur est admin (basée sur son rôle)
  const isAdmin = (): boolean => {
    return user?.role === 'Admin';
  };

  // Le Provider fournit ces valeurs à tous les composants enfants qui consomment ce contexte
  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Hook personnalisé pour accéder facilement au contexte Auth dans les composants
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Si on utilise useAuth hors d'un AuthProvider, on lance une erreur claire
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
