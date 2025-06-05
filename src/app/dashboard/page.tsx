// src/app/dashboard/page.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/Dashboard/DashboardLayout'; // Ajustez le chemin

// Shadcn/UI imports
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Définir l'interface User et l'état initial
interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  date_creation: string;
}

const initialUserStateForm: Partial<User> & { password?: string } = {
  nom: '',
  prenom: '',
  email: '',
  role: 'Utilisateur',
  password: '',
};


const DashboardPage = () => {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(initialUserStateForm);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Échec de la récupération des utilisateurs');
      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = () => {
    setIsEditing(false);
    setCurrentUserData(initialUserStateForm);
    setEditingUserId(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (userToEdit: User) => {
    setIsEditing(true);
    setCurrentUserData({ ...userToEdit, password: '' });
    setEditingUserId(userToEdit.id);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId: number) => {
    if (currentAdmin && userId === currentAdmin.id) {
      alert("Vous ne pouvez pas supprimer votre propre compte !");
      return;
    }
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      try {
        const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || 'Échec de la suppression');
        }
        alert("Utilisateur supprimé avec succès !");
        fetchUsers();
      } catch (err: any) {
        alert(`Erreur: ${err.message}`);
      }
    }
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const url = isEditing && editingUserId ? `/api/users/${editingUserId}` : '/api/users';
    const method = isEditing ? 'PUT' : 'POST';

    const payload: any = { ...currentUserData };
    if (isEditing && (!payload.password || payload.password.trim() === '')) {
      delete payload.password;
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || (isEditing ? 'Échec de la mise à jour' : 'Échec de l\'ajout'));
      }
      alert(`Utilisateur ${isEditing ? 'mis à jour' : 'ajouté'} avec succès !`);
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setCurrentUserData(prev => ({ ...prev, role: value }));
  };

  const mainContent = () => {
    if (isLoading && users.length === 0) return <div className="text-center py-10">Chargement des utilisateurs...</div>;
    // MODIFICATION CSS POUR LE MESSAGE D'ERREUR
    if (error) return <div className="text-center text-[#e30e1b] py-10">Erreur: {error}</div>;

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>
          {/* MODIFICATION CSS POUR LE BOUTON "AJOUTER UN UTILISATEUR" */}
          <Button className='bg-white text-black hover:bg-gray-300 cursor-pointer' onClick={handleAddUser} disabled={isLoading}>
            Ajouter un utilisateur
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='text-white'>ID</TableHead>
              <TableHead className='text-white'>Nom</TableHead>
              <TableHead className='text-white'>Prénom</TableHead>
              <TableHead className='text-white'>Email</TableHead>
              <TableHead className='text-white'>Rôle</TableHead>
              <TableHead className='text-white'>Date Création</TableHead>
              <TableHead className="text-right text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                <TableCell className="py-3 px-4">{user.id}</TableCell>
                <TableCell className="py-3 px-4">{user.nom}</TableCell>
                <TableCell className="py-3 px-4">{user.prenom}</TableCell>
                <TableCell className="py-3 px-4">{user.email}</TableCell>
                <TableCell className="py-3 px-4">{user.role}</TableCell>
                <TableCell className="py-3 px-4">{new Date(user.date_creation).toLocaleDateString()}</TableCell>
                <TableCell className="text-right space-x-2 py-3 px-4">
                  <Button
                    className='bg-amber-600 hover:bg-amber-500 text-white cursor-pointer'
                    size="sm"
                    onClick={() => handleEditUser(user)}
                    disabled={isLoading}
                  >
                    Modifier
                  </Button>
                  {/* MODIFICATION CSS POUR LE BOUTON "SUPPRIMER" */}
                  <Button
                    className='bg-[#e30e1b] hover:bg-[#c50d18] text-white cursor-pointer' // Ajout de hover
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={isLoading || (currentAdmin?.id === user.id)}
                  >
                    Supprimer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Modale */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border-gray-700">
            <DialogHeader><DialogTitle className="text-white">{isEditing ? 'Modifier' : 'Ajouter'} un utilisateur</DialogTitle></DialogHeader>
            <form onSubmit={handleFormSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="nom" className="text-right col-span-1">Nom</Label><Input id="nom" name="nom" value={currentUserData.nom || ''} onChange={handleInputChange} className="col-span-3 bg-gray-800 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500" required /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="prenom" className="text-right col-span-1">Prénom</Label><Input id="prenom" name="prenom" value={currentUserData.prenom || ''} onChange={handleInputChange} className="col-span-3 bg-gray-800 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500" required /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="email" className="text-right col-span-1">Email</Label><Input id="email" name="email" type="email" value={currentUserData.email || ''} onChange={handleInputChange} className="col-span-3 bg-gray-800 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500" required /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="password" className="text-right col-span-1">Mot de passe</Label><Input id="password" name="password" type="password" placeholder={isEditing ? "Laisser vide pour ne pas changer" : ""} value={currentUserData.password || ''} onChange={handleInputChange} className="col-span-3 bg-gray-800 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500" required={!isEditing} /></div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right col-span-1">Rôle</Label>
                  <Select name="role" value={currentUserData.role || 'Utilisateur'} onValueChange={handleRoleChange}>
                    <SelectTrigger className="col-span-3 bg-gray-800 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"><SelectValue placeholder="Sélectionner un rôle" /></SelectTrigger>
                    <SelectContent className="bg-gray-800 text-white border-gray-700"><SelectItem value="Utilisateur" className="hover:bg-gray-700 focus:bg-gray-700">Utilisateur</SelectItem><SelectItem value="Admin" className="hover:bg-gray-700 focus:bg-gray-700">Admin</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="sm:justify-start pt-4">
                <DialogClose asChild><Button type="button" variant="secondary" className="bg-gray-600 hover:bg-gray-500" disabled={isSubmitting}>Annuler</Button></DialogClose>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-500" disabled={isSubmitting}>{isSubmitting ? "Sauvegarde..." : "Sauvegarder"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  return (
    <DashboardLayout>
      {mainContent()}
    </DashboardLayout>
  );
};

export default DashboardPage;