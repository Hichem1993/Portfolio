// src/components/Home/Navbar/Navbar.tsx
"use client" // Ce fichier est un composant client-side (React côté navigateur)


// Composants et outils de Next.js
import Link from "next/link" // Pour créer des liens de navigation
import Image from "next/image" // Pour afficher des images optimisées
import { usePathname } from "next/navigation" // Pour récupérer l’URL courante

// Hooks React
import { useState, useEffect, useMemo } from "react"

// Contextes personnalisés (authentification & panier)
import { useAuth } from "@/contexts/AuthContext"
import { useCart } from "@/contexts/CartContext"

// Composants UI & utilitaires (ShadCN + icônes)
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuContent,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils" // Pour combiner des classes conditionnellement
import { Button } from "@/components/ui/button"
import { ShoppingCart, UserCircle } from "lucide-react" // Icônes SVG

// --- TYPES ---

// Type pour une sous-catégorie de service
interface ServiceSubCategory {
  id: number
  nom: string
  slugs: string
}

// Type pour une catégorie principale de service
interface ServiceMainCategory {
  id: number
  nom: string
  slugs: string
  sous_categories: ServiceSubCategory[]
}

// Liens principaux visibles dans la navbar
const navItemsBase = [
  { label: "Accueil", href: "/" },
  { label: "À propos", href: "/a-propos" },
  { label: "Portfolio", href: "/portfolio" },
]

// --- COMPOSANT NAVBAR ---

const Navbar = () => {
  const pathname = usePathname() // Récupère le chemin actuel pour appliquer les styles actifs
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false) // État pour le menu mobile

  // Infos sur l'utilisateur connecté depuis le context d'auth
  const { user, logout, isLoading: authIsLoading, isAdmin } = useAuth()

  // Infos sur le panier
  const { cartItems, isCartInitiallyLoaded } = useCart()

  // État pour stocker les catégories de service dynamiques
  const [serviceNav, setServiceNav] = useState<ServiceMainCategory[]>([])
  const [serviceNavLoading, setServiceNavLoading] = useState(true)

  // Récupération des catégories de service depuis une API
  useEffect(() => {
    const fetchServiceNavigation = async () => {
      try {
        setServiceNavLoading(true)
        const response = await fetch("/api/services/navigation")
        if (!response.ok) throw new Error("Erreur lors de la récupération des services")
        const data = await response.json()
        setServiceNav(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Erreur services :", error)
        setServiceNav([])
      } finally {
        setServiceNavLoading(false)
      }
    }

    fetchServiceNavigation()
  }, [])

  // Ferme le menu mobile à chaque changement de page
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // --- HANDLERS (gestionnaires) ---

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)
  const handleMobileLinkClick = () => setIsMobileMenuOpen(false)
  const handleLogout = () => {
    logout()
    setIsMobileMenuOpen(false)
  }

  // Calcule dynamiquement le nombre total d'articles dans le panier
  const totalCartItems = useMemo(() => {
    if (!isCartInitiallyLoaded) return 0
    return cartItems.reduce((count, item) => count + item.quantite, 0)
  }, [cartItems, isCartInitiallyLoaded])

  return (
    <nav className="bg-black text-white sticky top-0 z-50 font-[var(--font-montserrat)] shadow-[0_4px_10px_0px_rgba(255,255,255,0.15)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo à gauche */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/Logo-blanc.png"
                alt="Logo Hichem Ben Ayed"
                width={120}
                height={32}
                className="h-10 w-auto"
                priority
              />
            </Link>
          </div>

          {/* MENU DESKTOP (visible sur écran moyen et plus) */}
          <div className="hidden md:flex items-center space-x-4">
            <NavigationMenu>
              <NavigationMenuList className="space-x-1">
                
                {/* Liens principaux (Accueil, À propos...) */}
                {navItemsBase.map((item) => (
                  <NavigationMenuItem key={item.label}>
                    <NavigationMenuLink
                      asChild
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "uppercase text-sm font-medium bg-transparent text-white hover:bg-transparent hover:text-[#e30e1b]",
                        { "bg-[#e30e1b] text-white": pathname === item.href }
                      )}
                    >
                      <Link href={item.href}>{item.label}</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}

                {/* MENU DÉROULANT : SERVICES */}
                {!serviceNavLoading && serviceNav.length > 0 && (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "uppercase text-sm font-medium bg-transparent text-white hover:text-[#e30e1b]",
                        { "bg-[#e30e1b] text-white": pathname.startsWith("/services") }
                      )}
                    >
                      Services
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="bg-black border border-gray-700 shadow-lg text-white">
                      <ul className="grid gap-3 p-4 w-[600px] lg:grid-cols-2">
                        {serviceNav.map((mainCat) => (
                          <li key={mainCat.id} className="flex flex-col">
                            {/* Lien vers la catégorie principale */}
                            <Link
                              href={`/services/${mainCat.slugs}`}
                              className="block p-3 rounded-md hover:bg-gray-800"
                            >
                              <div className="font-semibold text-md mb-1">{mainCat.nom}</div>
                            </Link>
                            {/* Liste des sous-catégories */}
                            <ul className="mt-1 space-y-0.5 pl-3">
                              {mainCat.sous_categories.map((subCat) => (
                                <li key={subCat.id}>
                                  <NavigationMenuLink asChild>
                                    <Link
                                      href={`/services/${mainCat.slugs}/${subCat.slugs}`}
                                      className="block p-2 rounded-md text-sm text-gray-300 hover:bg-[#e30e1b] hover:text-black transition-colors"
                                    >
                                      {subCat.nom}
                                    </Link>
                                  </NavigationMenuLink>
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )}

                {/* Lien vers la page de contact */}
                <NavigationMenuItem>
                  <NavigationMenuLink
                    asChild
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "uppercase text-sm font-medium bg-transparent text-white hover:bg-transparent hover:text-[#e30e1b]",
                      { "bg-[#e30e1b] text-white": pathname === "/contact" }
                    )}
                  >
                    <Link href="/contact">Contact</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {/* Lien vers dashboard si admin connecté */}
                {!authIsLoading && isAdmin() && (
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      asChild
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "uppercase text-sm font-medium text-black hover:bg-[#e30e1b] hover:text-white",
                        { "bg-[#e30e1b]": pathname === "/dashboard" }
                      )}
                    >
                      <Link href="/dashboard">Dashboard</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>

            {/* Bouton Connexion / Déconnexion */}
            {!authIsLoading &&
              (user ? (
                <Button
                  onClick={handleLogout}
                  className="text-black bg-white px-4 py-2 rounded-md text-sm uppercase hover:bg-[#e30e1b] hover:text-white cursor-pointer"
                  variant="default"
                >
                  Déconnexion
                </Button>
              ) : (
                <Link
                  href="/connexion"
                  className="text-white border border-white px-4 py-2 rounded-md text-sm uppercase hover:bg-white hover:text-black"
                >
                  Connexion
                </Link>
              ))}

            {/* Icône profil si connecté */}
            {user && (
              <Link href="/profil" className="relative text-white hover:text-[#e30e1b] transition-colors p-2 ml-2">
                <UserCircle size={24} strokeWidth={1.5} />
              </Link>
            )}

            {/* Icône panier avec compteur */}
            {user && isCartInitiallyLoaded && (
              <Link href="/panier" className="relative text-white hover:text-[#e30e1b] transition-colors p-2 ml-2">
                <ShoppingCart size={24} strokeWidth={1.5} />
                {totalCartItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#e30e1b] text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center leading-none">
                    {totalCartItems}
                  </span>
                )}
              </Link>
            )}
          </div>

          {/* --- MENU BURGER MOBILE --- */}
          <div className="md:hidden flex items-center">
            {/* Icône panier mobile */}
            {user && isCartInitiallyLoaded && (
              <Link href="/panier" className="relative text-white hover:text-[#e30e1b] transition-colors p-2 mr-1">
                <ShoppingCart size={24} strokeWidth={1.5} />
                {totalCartItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#e30e1b] text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center leading-none">
                    {totalCartItems}
                  </span>
                )}
              </Link>
            )}

            {/* Bouton hamburger */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-white hover:text-[#e30e1b] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#e30e1b]"
            >
              <span className="sr-only">Ouvrir le menu</span>
              {isMobileMenuOpen ? (
                // Icône fermeture
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Icône menu
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* --- MENU MOBILE (DÉROULANT) --- */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out overflow-y-auto bg-black border-t border-gray-800 ${
          isMobileMenuOpen ? "max-h-[calc(100vh-4rem)] opacity-100" : "max-h-0 opacity-0"
        }`}
        id="mobile-menu"
      >
        <ul className="px-2 pt-2 pb-8 space-y-1 sm:px-3">
          {/* Liens principaux */}
          {navItemsBase.map((item) => (
            <li key={`mobile-${item.label}`}>
              <Link
                href={item.href}
                onClick={handleMobileLinkClick}
                className={cn("block px-3 py-2 rounded-md text-base font-medium uppercase text-white", {
                  "bg-[#e30e1b]": pathname === item.href,
                })}
              >
                {item.label}
              </Link>
            </li>
          ))}

          {/* Services mobile */}
          {!serviceNavLoading && serviceNav.length > 0 && (
            <li>
              <span className="block px-3 py-2 text-base font-medium uppercase text-gray-400">Services</span>
              <ul className="pl-3">
                {serviceNav.map((mainCat) => (
                  <li key={`mobile-main-${mainCat.id}`}>
                    <Link
                      href={`/services/${mainCat.slugs}`}
                      onClick={handleMobileLinkClick}
                      className={cn(
                        "block px-3 py-2 text-sm text-white",
                        pathname.startsWith(`/services/${mainCat.slugs}`) ? "text-[#e30e1b]" : "hover:text-[#e30e1b]"
                      )}
                    >
                      {mainCat.nom}
                    </Link>
                    <ul className="pl-3">
                      {mainCat.sous_categories.map((subCat) => (
                        <li key={`mobile-sub-${subCat.id}`}>
                          <Link
                            href={`/services/${mainCat.slugs}/${subCat.slugs}`}
                            onClick={handleMobileLinkClick}
                            className={cn(
                              "block px-3 py-2 text-xs text-gray-300",
                              pathname === `/services/${mainCat.slugs}/${subCat.slugs}`
                                ? "text-[#e30e1b]"
                                : "hover:text-[#e30e1b]"
                            )}
                          >
                            - {subCat.nom}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </li>
          )}

          {/* Contact */}
          <li>
            <Link
              href="/contact"
              onClick={handleMobileLinkClick}
              className={cn("block px-3 py-2 rounded-md text-base font-medium uppercase text-white", {
                "bg-[#e30e1b]": pathname === "/contact",
              })}
            >
              Contact
            </Link>
          </li>

          {/* Dashboard admin */}
          {!authIsLoading && isAdmin() && (
            <li>
              <Link
                href="/dashboard"
                onClick={handleMobileLinkClick}
                className={cn("block px-3 py-2 rounded-md text-base font-medium uppercase text-white", {
                  "bg-[#e30e1b]": pathname === "/dashboard",
                })}
              >
                Dashboard
              </Link>
            </li>
          )}

          {/* Lien profil */}
          {user && (
            <li>
              <Link
                href="/profil"
                onClick={handleMobileLinkClick}
                className="block px-3 py-2 rounded-md text-base font-medium uppercase text-white hover:text-[#e30e1b]"
              >
                Profil
              </Link>
            </li>
          )}

          {/* Connexion / Déconnexion */}
          {!authIsLoading && (
            <li>
              {user ? (
                <Button
                  onClick={handleLogout}
                  className="w-full text-white border border-white text-center mt-2 hover:bg-white hover:text-black transition uppercase text-base py-2"
                >
                  Déconnexion
                </Button>
              ) : (
                <Link
                  href="/connexion"
                  onClick={handleMobileLinkClick}
                  className="block px-3 py-2 rounded-md text-base font-medium uppercase text-white border border-white text-center mt-2 hover:bg-white hover:text-black transition"
                >
                  Connexion
                </Link>
              )}
            </li>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar