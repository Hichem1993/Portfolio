// src/contexts/AuthContext.tsx // Assurez-vous que ce chemin est celui utilisé dans vos imports

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Interface pour l'utilisateur
interface User {
  id: number;
  email: string;
  nom?: string;
  prenom?: string;
  role: string;
}

// Interface pour la valeur du contexte
interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean;
  isAdmin: () => boolean;
}

// 1. Création du Contexte - Assurez-vous que ce 'AuthContext' est bien celui utilisé plus bas
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Création du Provider - Assurez-vous que 'AuthProvider' est bien le nom exporté et importé dans layout.tsx
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Commence en chargement
  const router = useRouter();

  useEffect(() => {
    // Charger l'utilisateur depuis localStorage au montage initial
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("AuthProvider: Failed to parse user from localStorage", error);
      localStorage.removeItem('user');
    }
    setIsLoading(false); // Fin du chargement initial
  }, []); // S'exécute une seule fois au montage

  const login = (userData: User) => {
    setUser(userData);
    try {
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error("AuthProvider: Failed to save user to localStorage", error);
    }
  };

  const logout = async () => {
    setUser(null);
    try {
      localStorage.removeItem('user');
      // Optionnel: si vous avez une API de déconnexion
      // await fetch('/api/logout', { method: 'POST' }); 
    } catch (error) {
      console.error("AuthProvider: Failed during logout process", error);
    }
    router.push('/'); // Rediriger après la déconnexion
  };

  const isAdmin = (): boolean => {
    return user?.role === 'Admin';
  };

  // Fournir la valeur du contexte
  return (
    // Utilise bien le 'AuthContext' défini ci-dessus ?
    <AuthContext.Provider value={{ user, login, logout, isLoading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Hook personnalisé pour consommer le contexte - Assurez-vous que 'useAuth' est le nom exporté et importé
export const useAuth = (): AuthContextType => {
  // Utilise bien le 'AuthContext' défini ci-dessus ?
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Cette erreur signifie que ce composant (ou celui qui appelle useAuth)
    // n'est pas un descendant de <AuthProvider>
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};