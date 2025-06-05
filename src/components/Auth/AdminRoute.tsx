"use client"

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext'; // Ajustez le chemin

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isLoading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin())) {
      router.push('/'); // Rediriger si non admin ou non connecté
    }
  }, [user, isLoading, isAdmin, router]);

  if (isLoading || !user || !isAdmin()) {
    // Optionnel: Afficher un message de chargement ou "Accès non autorisé"
    // Pour l'instant, on retourne null pour ne pas afficher le contenu prématurément
    return <p className="text-center py-10">Vérification des droits d'accès...</p>; // Ou null
  }

  return <>{children}</>;
};

export default AdminRoute;