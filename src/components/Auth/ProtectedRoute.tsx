// src/components/Auth/ProtectedRoute.tsx
"use client";

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext'; // Ajustez le chemin

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading: authIsLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Attendre que l'état d'authentification soit résolu
    if (!authIsLoading && !user) {
      // Si l'auth est chargée et qu'il n'y a pas d'utilisateur, rediriger vers la connexion
      // Passer l'URL actuelle pour redirection après connexion
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/connexion?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [user, authIsLoading, router]);

  // Pendant le chargement de l'auth ou si l'utilisateur n'est pas encore là (et qu'on va rediriger)
  if (authIsLoading || !user) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e30e1b]"></div>
      </div>
    );
  }

  // Si l'utilisateur est connecté, afficher le contenu protégé
  return <>{children}</>;
};

export default ProtectedRoute;