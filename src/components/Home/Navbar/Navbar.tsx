"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

// ShadCN UI
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

interface NavItemConfig {
  label: string;
  href: string;
}

const navItems: NavItemConfig[] = [
  { label: "Accueil", href: "/" },
  { label: "À propos", href: "/a-propos" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
];

const Navbar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`
      bg-black
      sticky top-0 z-50
      font-[var(--font-montserrat)]
      shadow-[0_4px_10px_0px_rgba(255,255,255,0.15)]
    `}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Section Logo */}
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

          {/* Section Menu Desktop avec Connexion */}
          <div className="hidden md:flex items-center space-x-4">
            <NavigationMenu>
              <NavigationMenuList className="space-x-1">
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.label}>
                    <NavigationMenuLink asChild
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "uppercase text-sm font-medium",
                        "bg-transparent hover:bg-transparent focus:bg-transparent",
                        "text-white",
                        {
                          "bg-[#e30e1b] text-white hover:text-white hover:bg-[#e30e1b]": pathname === item.href,
                          "hover:text-[#e30e1b] focus:text-[#e30e1b]": pathname !== item.href,
                        }
                      )}
                    >
                      <Link href={item.href}>{item.label}</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

            {/* Bouton Connexion */}
            <Link
              href="/connexion"
              className="text-white border border-white px-4 py-2 rounded-md text-sm uppercase hover:bg-white hover:text-black transition"
            >
              Connexion
            </Link>
          </div>

          {/* Bouton Menu Burger pour Mobile */}
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

      {/* Section Menu Mobile */}
      <div
        className={`
          md:hidden transition-all duration-300 ease-in-out overflow-hidden bg-black border-t border-gray-800
          ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}
        `}
        id="mobile-menu"
      >
        <ul className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                onClick={handleMobileLinkClick}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium uppercase",
                  "text-white",
                  {
                    "bg-[#e30e1b] text-white": pathname === item.href,
                    "hover:text-[#e30e1b]": pathname !== item.href,
                  }
                )}
                aria-current={pathname === item.href ? 'page' : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}

          {/* Lien Connexion pour mobile */}
          <li>
            <Link
              href="/connexion"
              onClick={handleMobileLinkClick}
              className="block px-3 py-2 rounded-md text-base font-medium uppercase text-white border border-white text-center hover:bg-white hover:text-black transition"
            >
              Connexion
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
