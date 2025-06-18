// src/app/dashboard/page.tsx
"use client";

import { useState } from 'react';
import DashboardLayout, { DashboardSection } from '@/components/Dashboard/DashboardLayout'; 

import UserManagement from '@/components/Dashboard/UserManagement'; 
import CategoryManagement from '@/components/Dashboard/CategoryManagement';
import SubCategoryManagement from '@/components/Dashboard/SubCategoryManagement'; 
import ServiceManagement from '@/components/Dashboard/ServiceManagement';
import OrderManagement from '@/components/Dashboard/OrderManagement'; // <--- IMPORTER ICI

const DashboardPage = () => {
  const [activeSection, setActiveSection] = useState<DashboardSection>('utilisateurs');

  const renderSectionContent = () => {
    console.log("DashboardPage: Rendu de la section ->", activeSection); 
    switch (activeSection) {
      case 'utilisateurs':
        return <UserManagement />;
      case 'categories':
        return <CategoryManagement />;
      case 'sous-categories':
        return <SubCategoryManagement />;
      case 'services':
        return <ServiceManagement />;
      case 'commandes': // <--- NOUVEAU CAS
        return <OrderManagement />;
      default:
        console.warn("DashboardPage: Section active inconnue:", activeSection);
        return <UserManagement />; 
    }
  };

  return (
    <DashboardLayout 
      activeSection={activeSection} 
      setActiveSection={setActiveSection}
    >
      {renderSectionContent()}
    </DashboardLayout>
  );
};

export default DashboardPage;