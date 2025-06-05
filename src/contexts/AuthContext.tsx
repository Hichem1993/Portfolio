"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  nom?: string;
  prenom?: string;
  role: string; // Rôle de l'utilisateur (ex: "Admin", "Utilisateur")
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean; // Pour gérer le chargement initial depuis localStorage
  isAdmin: () => boolean; // Fonction pour vérifier si l'utilisateur est Admin
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Essayer de charger l'utilisateur depuis localStorage au montage initial
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('user'); // Nettoyer en cas d'erreur de parsing
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    try {
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error("Failed to save user to localStorage", error);
    }
  };

  const logout = async () => {
    setUser(null);
    try {
      localStorage.removeItem('user');
      // Optionnel : appeler une API de déconnexion pour invalider un token serveur
      // await fetch('/api/logout', { method: 'POST' });
    } catch (error) { // <-- Correction ici: accolades pour le bloc catch
      console.error("Failed to remove user from localStorage or logout API failed", error);
    }
    // Rediriger vers la page d'accueil après la déconnexion
    router.push('/');
  };

  const isAdmin = (): boolean => {
    return user?.role === 'Admin'; // Vérifie si le rôle de l'utilisateur est "Admin"
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};