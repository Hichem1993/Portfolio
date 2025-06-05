// src/components/Dashboard/DashboardLayout.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import AdminRoute from '@/components/Auth/AdminRoute';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

// Mettre à jour les items de la sidebar
const sidebarNavItems = [
  { title: 'Gestion Utilisateurs', href: '/dashboard' }, // Le contenu principal
  // { title: 'Statistiques', href: '/dashboard/stats' }, // Exemple d'un futur lien
  // { title: 'Paramètres', href: '/dashboard/settings' }, // Exemple d'un futur lien
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  return (
    <AdminRoute>
      <div className="flex min-h-screen bg-gray-950 text-white">
        <aside className="w-64 bg-gray-900 p-4 space-y-2 border-r border-gray-700 shrink-0"> {/* shrink-0 pour éviter le rétrécissement */}
          <h2 className="text-xl font-semibold mb-4">Menu Admin</h2>
          <nav>
            <ul>
              {sidebarNavItems.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    className={cn(
                      "block px-3 py-2 rounded-md text-sm font-medium hover:bg-black",
                      // Mettre en évidence si le chemin correspond exactement ou commence par (pour de futures sous-pages)
                      (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) 
                        ? "bg-[#e30e1b] text-white" 
                        : "text-gray-300"
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="flex-1 p-6 lg:p-10 overflow-auto">
          {children}
        </main>
      </div>
    </AdminRoute>
  );
};

export default DashboardLayout;