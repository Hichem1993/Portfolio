// src/components/Home/Navbar/Navbar.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// ShadCN UI
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuContent,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"; // Assurez-vous que ce chemin est correct
import { cn } from "@/lib/utils"; // Assurez-vous que ce chemin est correct
import { Button } from '@/components/ui/button'; // Assurez-vous que ce chemin est correct

interface ServiceSubCategory {
  id: number;
  nom: string;
  slugs: string;
}
interface ServiceMainCategory {
  id: number;
  nom: string;
  slugs: string;
  sous_categories: ServiceSubCategory[];
}

const navItemsBase = [
  { label: "Accueil", href: "/" },
  { label: "À propos", href: "/a-propos" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Contact", href: "/contact" },
];

const Navbar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isLoading: authIsLoading, isAdmin } = useAuth();

  const [serviceNav, setServiceNav] = useState<ServiceMainCategory[]>([]);
  const [serviceNavLoading, setServiceNavLoading] = useState(true);

  useEffect(() => {
    const fetchServiceNavigation = async () => {
      try {
        setServiceNavLoading(true);
        const response = await fetch('/api/services/navigation');
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Navbar: Réponse API non OK:", response.status, errorText);
          throw new Error(`Échec de la récupération de la navigation des services: ${response.status}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
            setServiceNav(data);
        } else {
            console.error("Navbar: Les données reçues de l'API ne sont pas un tableau:", data);
            setServiceNav([]);
        }
      } catch (error) {
        console.error("Navbar: Erreur dans fetchServiceNavigation:", error);
        setServiceNav([]);
      } finally {
        setServiceNavLoading(false);
      }
    };
    fetchServiceNavigation();
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const handleMobileLinkClick = () => setIsMobileMenuOpen(false);
  const handleLogout = () => { logout(); setIsMobileMenuOpen(false); };

  return (
    <nav className="bg-black text-white sticky top-0 z-50 font-[var(--font-montserrat)] shadow-[0_4px_10px_0px_rgba(255,255,255,0.15)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image src="/Logo-blanc.png" alt="Logo Hichem Ben Ayed" width={120} height={32} className="h-10 w-auto" priority />
            </Link>
          </div>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <NavigationMenu>
              <NavigationMenuList className="space-x-1">
                {/* Liens de navigation de base */}
                {navItemsBase.map((item) => (
                  <NavigationMenuItem key={item.label}>
                    <NavigationMenuLink asChild
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "uppercase text-sm font-medium bg-transparent text-white",
                        "hover:bg-transparent hover:text-[#e30e1b]",
                        "focus:bg-transparent focus:text-[#e30e1b]",
                        { "bg-[#e30e1b] text-white hover:text-white focus:text-white": pathname === item.href }
                      )}
                    >
                      <Link href={item.href}>{item.label}</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}

                {/* Menu déroulant pour "Services" */}
                {!serviceNavLoading && serviceNav && serviceNav.length > 0 && (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "uppercase text-sm font-medium bg-transparent text-white",
                        "hover:bg-transparent hover:text-[#e30e1b]",
                        "focus:bg-transparent focus:text-[#e30e1b]",
                        { "bg-[#e30e1b] text-white hover:text-white focus:text-white": pathname.startsWith('/services') }
                      )}
                    >
                      Services
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="bg-black border border-gray-700 shadow-lg text-white">
                      <ul className="grid gap-3 p-4 w-[400px] md:w-[500px] lg:grid-cols-2 lg:w-[600px]">
                        {serviceNav.map((mainCat) => (
                          <li key={mainCat.id} className="flex flex-col">
                            <Link
                              href={`/services/${mainCat.slugs}`}
                              className="block p-3 rounded-md hover:bg-gray-800 transition-colors"
                            >
                              <div className="font-semibold text-white text-md mb-1">
                                {mainCat.nom}
                              </div>
                            </Link>
                            {Array.isArray(mainCat.sous_categories) && mainCat.sous_categories.length > 0 && (
                              <ul className="mt-1 space-y-0.5 pl-3"> {/* Indentation pour sous-catégories */}
                                {mainCat.sous_categories.map((subCat) => (
                                  <li key={subCat.id}>
                                    <NavigationMenuLink asChild>
                                      <Link
                                        href={`/services/${mainCat.slugs}/${subCat.slugs}`}
                                        className="block p-2 rounded-md text-sm text-gray-300 hover:bg-[#e30e1b] hover:text-black focus:bg-[#e30e1b] focus:text-white transition-colors"
                                      >
                                        {subCat.nom}
                                      </Link>
                                    </NavigationMenuLink>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )}

                {/* Lien Dashboard pour Admin */}
                {!authIsLoading && isAdmin() && (
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "uppercase text-sm font-medium bg-transparent text-white", { "bg-[#e30e1b] text-white hover:text-white focus:text-white": pathname === "/dashboard", "hover:text-[#e30e1b] focus:text-[#e30e1b]": pathname !== "/dashboard", })}>
                      <Link href="/dashboard">Dashboard</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>

            {/* Bouton Connexion/Déconnexion */}
            {!authIsLoading && (
              user ? (
                <Button onClick={handleLogout} className="text-white border border-white px-4 py-2 rounded-md text-sm uppercase hover:bg-white hover:text-black transition">
                  Déconnexion
                </Button>
              ) : (
                <Link href="/connexion" className="text-white border border-white px-4 py-2 rounded-md text-sm uppercase hover:bg-white hover:text-black transition">
                  Connexion
                </Link>
              )
            )}
          </div>

          {/* Bouton Menu Burger Mobile */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-white hover:text-[#e30e1b] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#e30e1b]"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Ouvrir le menu principal</span>
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden bg-black border-t border-gray-800 ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}
        id="mobile-menu"
      >
        <ul className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItemsBase.map((item) => (
            <li key={`mobile-base-${item.label}`}>
              <Link
                href={item.href}
                onClick={handleMobileLinkClick}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium uppercase text-white",
                  { "bg-[#e30e1b] text-white": pathname === item.href,
                    "hover:text-[#e30e1b]": pathname !== item.href,
                  }
                )}
                aria-current={pathname === item.href ? 'page' : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}
          
          {!serviceNavLoading && serviceNav && serviceNav.length > 0 && (
            <li>
              <span className="block px-3 py-2 text-base font-medium uppercase text-gray-400">Services</span>
              <ul className="pl-3">
                {serviceNav.map((mainCat) => (
                  <li key={`mobile-main-${mainCat.id}`} className="mt-1">
                    <Link
                      href={`/services/${mainCat.slugs}`}
                      onClick={handleMobileLinkClick}
                      className={cn(
                        "block px-3 py-2 rounded-md text-sm font-medium text-white",
                        pathname.startsWith(`/services/${mainCat.slugs}`) && !pathname.split('/')[3] ? "text-[#e30e1b]" : "hover:text-[#e30e1b]" // Actif pour catégorie principale
                      )}
                    >
                      {mainCat.nom}
                    </Link>
                    {Array.isArray(mainCat.sous_categories) && mainCat.sous_categories.length > 0 && (
                      <ul className="pl-3">
                          {mainCat.sous_categories.map(subCat => (
                              <li key={`mobile-sub-${subCat.id}`}>
                                  <Link
                                    href={`/services/${mainCat.slugs}/${subCat.slugs}`}
                                    onClick={handleMobileLinkClick}
                                    className={cn(
                                      "block px-3 py-2 rounded-md text-xs font-medium text-gray-300",
                                      pathname === `/services/${mainCat.slugs}/${subCat.slugs}` ? "text-[#e30e1b]" : "hover:text-[#e30e1b]" // Actif pour sous-catégorie
                                    )}
                                  >
                                      - {subCat.nom}
                                  </Link>
                              </li>
                          ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          )}

          {!authIsLoading && isAdmin() && (
            <li>
              <Link href="/dashboard" onClick={handleMobileLinkClick} className={cn("block px-3 py-2 rounded-md text-base font-medium uppercase text-white", { "bg-[#e30e1b] text-white": pathname === "/dashboard", "hover:text-[#e30e1b]": pathname !== "/dashboard", })}>
                Dashboard
              </Link>
            </li>
          )}
          {!authIsLoading && (
            <li>
              {user ? (
                <Button onClick={handleLogout} className="w-full bg-black text-white border border-white text-center mt-2 hover:bg-white hover:text-black transition uppercase text-base py-2">
                  Déconnexion
                </Button>
              ) : (
                <Link href="/connexion" onClick={handleMobileLinkClick} className="block px-3 py-2 rounded-md text-base font-medium uppercase text-white border border-white text-center mt-2 hover:bg-white hover:text-black transition">
                  Connexion
                </Link>
              )}
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;