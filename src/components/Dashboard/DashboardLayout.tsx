// src/components/Dashboard/DashboardLayout.tsx
"use client";

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import AdminRoute from '@/components/Auth/AdminRoute'; // Assurez-vous que ce chemin est correct
import { cn } from '@/lib/utils'; // Assurez-vous que ce chemin est correct
import { 
    Users, 
    LayoutGrid, 
    AlignCenter, 
    ShoppingBag as IconServices, 
    ListOrdered, 
    MessageSquare
} from 'lucide-react';

// Définir les types de sections possibles pour le typage fort
export type DashboardSection = 
  | 'utilisateurs' 
  | 'categories' 
  | 'sous-categories' 
  | 'services'
  | 'commandes'
  | 'contacts';

interface DashboardLayoutProps {
  children: ReactNode;
  activeSection: DashboardSection; // La section actuellement active
  setActiveSection: (section: DashboardSection) => void; // Fonction pour changer de section
}

// Mettre à jour les items de la sidebar pour utiliser la propriété 'section' et ajouter des icônes
const sidebarNavItems: { title: string; section: DashboardSection; icon: React.ElementType }[] = [
  { title: 'Gestion Utilisateurs', section: 'utilisateurs', icon: Users },
  { title: 'Gestion Catégories', section: 'categories', icon: LayoutGrid },
  { title: 'Gestion Sous-Catégories', section: 'sous-categories', icon: AlignCenter },
  { title: 'Gestion Services', section: 'services', icon: IconServices },
  { title: 'Gestion des Commandes', section: 'commandes', icon: ListOrdered },
  { title: 'Gestion des Contacts', section: 'contacts', icon: MessageSquare },
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeSection, setActiveSection }) => {
  const pathname = usePathname(); 

  return (
    <AdminRoute>
      <div className="flex min-h-[calc(100vh-var(--navbar-height,4rem))] bg-gray-950 text-white">
        <aside className="w-60 md:w-64 bg-gray-900 p-4 space-y-2 border-r border-gray-700 shrink-0 flex flex-col">
          <h2 className="text-xl font-semibold mb-6 text-center text-white">Menu Admin</h2>
          <nav className="flex-grow">
            <ul className="space-y-2">
              {sidebarNavItems.map((item) => (
                <li key={item.section}>
                  <button
                    onClick={() => setActiveSection(item.section)}
                    className={cn(
                      "w-full flex items-center px-3 py-2.5 rounded-md text-sm font-medium hover:bg-gray-700/80 transition-colors duration-150 text-left",
                      activeSection === item.section
                        ? "bg-[#e30e1b] text-white shadow-md" 
                        : "text-gray-300 hover:text-white"
                    )}
                    aria-current={activeSection === item.section ? 'page' : undefined}
                  >
                    <item.icon className="mr-3 h-5 w-5 shrink-0" aria-hidden="true" />
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </AdminRoute>
  );
};

export default DashboardLayout;