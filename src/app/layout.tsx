import type { Metadata } from "next"; 
// Import du type Metadata de Next.js pour typer les métadonnées de la page

import { Montserrat } from 'next/font/google'; 
// Import de la police Montserrat via le système de fonts Google de Next.js

import "./globals.css"; 
// Import des styles globaux CSS

import Navbar from "@/components/Home/Navbar/Navbar"; 
// Import du composant Navbar (barre de navigation), chemin ajusté selon l'arborescence

import { Footer } from "@/components/Home/Footer/Footer"; 
// Import du composant Footer (pied de page), chemin ajusté

import { AuthProvider } from "@/contexts/AuthContext"; 
// Import du fournisseur de contexte d'authentification, pour gérer l'état utilisateur

import { CartProvider } from "@/contexts/CartContext"; 
// Import du fournisseur de contexte pour le panier d'achat, gestion du panier global

// Configuration de la police Montserrat avec les options souhaitées
const montserrat = Montserrat({
  subsets: ['latin'], // Sous-ensemble des caractères latins
  weight: ['300', '400', '500', '600', '700', '800'], // taille de police inclus
  variable: '--font-montserrat', // Variable CSS personnalisée associée à cette police
});

export const metadata: Metadata = {
  title: "Hichem Ben Ayed - Portfolio UI Designer & Développeur Front-End", 
  description: "Découvrez le portfolio de Hichem Ben Ayed, UI Designer et Développeur Frontend. Projets de design créatif et développement web performant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode; 
  // Typage des enfants passés au layout : contenu des pages imbriquées
}>) {
  return (
    <html lang="fr" className={`${montserrat.variable} /* ...autres variables de police... */`}>
      <body className="bg-black text-white">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            {/* Affiche la barre de navigation en haut */}
            <main>
              {children}
              {/* Affiche le contenu principal des pages */}
            </main>
            <Footer />
            {/* Affiche le pied de page */}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
