// src/components/Dashboard/UserManagement.tsx
"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Ajustez si le chemin est différent

// Shadcn/UI imports - Vérifiez ces chemins
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";

// Interface pour les données utilisateur (identique à celle que vous aviez)
interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  date_creation: string; // La date vient comme string de l'API, formatée ensuite
}

// État initial pour le formulaire d'ajout/modification
const initialUserStateForm: Partial<User> & { password?: string } = {
  nom: '',
  prenom: '',
  email: '',
  role: 'Utilisateur', // Rôle par défaut pour un nouvel utilisateur
  password: '',
};

const UserManagement = () => {
  // Utiliser useAuth pour obtenir l'admin actuel (pour la protection anti-auto-suppression)
  const { user: currentAdmin, isLoading: authIsLoading } = useAuth(); 
  
  // États pour la liste des utilisateurs, le chargement et les erreurs
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour la modale d'ajout/modification
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(initialUserStateForm); // Données de l'utilisateur en cours d'édition/ajout
  const [isEditing, setIsEditing] = useState(false); // True si on modifie, false si on ajoute
  const [editingUserId, setEditingUserId] = useState<number | null>(null); // ID de l'utilisateur en cours d'édition
  const [isSubmitting, setIsSubmitting] = useState(false); // Indicateur de chargement pour la soumission du formulaire

  // Fonction pour récupérer la liste des utilisateurs depuis l'API
  const fetchUsers = async () => {
    console.log("UserManagement: fetchUsers appelé");
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/users'); // API GET pour lister les utilisateurs
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Échec de la récupération des utilisateurs');
      }
      const data = await response.json();
      console.log("UserManagement: Utilisateurs reçus de l'API:", data);
      setUsers(Array.isArray(data) ? data : []); // S'assurer que c'est un tableau
    } catch (err: any) {
      console.error("UserManagement: Erreur dans fetchUsers:", err);
      setError(err.message);
      setUsers([]); // Vider en cas d'erreur
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les utilisateurs au montage du composant
  useEffect(() => {
    fetchUsers();
  }, []); // Le tableau de dépendances vide signifie que cela s'exécute une fois après le premier rendu

  // Ouvrir la modale en mode "ajout"
  const handleAddUser = () => {
    setIsEditing(false);
    setCurrentUserData(initialUserStateForm); // Réinitialiser le formulaire
    setEditingUserId(null);
    setIsModalOpen(true);
  };

  // Ouvrir la modale en mode "édition" avec les données de l'utilisateur
  const handleEditUser = (userToEdit: User) => {
    setIsEditing(true);
    setCurrentUserData({ ...userToEdit, password: '' }); // Ne pas pré-remplir le champ mot de passe
    setEditingUserId(userToEdit.id);
    setIsModalOpen(true);
  };

  // Gérer la suppression d'un utilisateur
  const handleDeleteUser = async (userId: number) => {
    if (currentAdmin && userId === currentAdmin.id) {
      alert("Action non autorisée : Vous ne pouvez pas supprimer votre propre compte administrateur.");
      return;
    }
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ID ${userId} ? Cette action est irréversible.`)) {
      setIsLoading(true); // Peut-être un indicateur de chargement spécifique à la suppression
      try {
        const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' }); // API DELETE pour un utilisateur
        if (!response.ok) {
          const result = await response.json().catch(() => ({}));
          throw new Error(result.error || 'Échec de la suppression de l\'utilisateur.');
        }
        alert("Utilisateur supprimé avec succès !");
        fetchUsers(); // Recharger la liste des utilisateurs
      } catch (err: any) {
        alert(`Erreur lors de la suppression: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Gérer la soumission du formulaire (ajout ou modification)
  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null); // Réinitialiser les erreurs du formulaire

    const url = isEditing && editingUserId ? `/api/users/${editingUserId}` : '/api/users';
    const method = isEditing ? 'PUT' : 'POST';

    // Préparer le payload, ne pas inclure le mot de passe s'il est vide en mode édition
    const payload: any = { ...currentUserData };
    if (isEditing && (!payload.password || payload.password.trim() === '')) {
      delete payload.password;
    }
    // En mode ajout, le mot de passe est requis (vérification faite par l'API)

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `Échec de ${isEditing ? 'la mise à jour' : 'l\'ajout'} de l'utilisateur.`);
      }
      alert(`Utilisateur ${isEditing ? 'mis à jour' : 'ajouté'} avec succès !`);
      setIsModalOpen(false); // Fermer la modale
      fetchUsers(); // Recharger la liste
    } catch (err: any) {
      alert(`Erreur: ${err.message}`); // Afficher l'erreur à l'utilisateur (pourrait être amélioré avec un état d'erreur dans la modale)
      setError(err.message); // Stocker l'erreur pour l'afficher potentiellement dans la modale
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gérer les changements dans les champs du formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentUserData(prev => ({ ...prev, [name]: value }));
  };

  // Gérer le changement de rôle dans le Select
  const handleRoleChange = (value: string) => {
    setCurrentUserData(prev => ({ ...prev, role: value }));
  };

  // Affichage pendant le chargement initial des utilisateurs
  if (isLoading && users.length === 0) {
    return <div className="text-center py-10 text-white">Chargement des utilisateurs...</div>;
  }

  // Affichage en cas d'erreur de chargement des utilisateurs
  if (error && users.length === 0) { // Afficher l'erreur seulement si la liste est vide
    return <div className="text-center text-[#e30e1b] py-10">Erreur: {error}</div>;
  }

  // Rendu principal du composant de gestion des utilisateurs
  return (
    <div className="bg-gray-800/30 p-4 md:p-6 rounded-lg border border-gray-700/50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Gestion des Utilisateurs</h1>
        <Button 
          className='bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white transition-all' 
          onClick={handleAddUser} 
          disabled={isLoading} // Désactiver si la liste principale charge
        >
          Ajouter un utilisateur
        </Button>
      </div>

      {/* Tableau affichant les utilisateurs */}
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="border-b border-gray-700">
              <TableHead className='text-white px-3 py-3.5 text-left text-sm font-semibold'>ID</TableHead>
              <TableHead className='text-white px-3 py-3.5 text-left text-sm font-semibold'>Nom</TableHead>
              <TableHead className='text-white px-3 py-3.5 text-left text-sm font-semibold'>Prénom</TableHead>
              <TableHead className='text-white px-3 py-3.5 text-left text-sm font-semibold'>Email</TableHead>
              <TableHead className='text-white px-3 py-3.5 text-left text-sm font-semibold'>Rôle</TableHead>
              <TableHead className='text-white px-3 py-3.5 text-left text-sm font-semibold'>Date Création</TableHead>
              <TableHead className="text-right text-white px-3 py-3.5 text-sm font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((userItem) => ( // Renommer user en userItem pour éviter conflit avec user de useAuth
              <TableRow key={userItem.id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                <TableCell className="py-3 px-3 text-gray-300 text-sm">{userItem.id}</TableCell>
                <TableCell className="py-3 px-3 text-gray-200 text-sm">{userItem.nom || 'N/A'}</TableCell>
                <TableCell className="py-3 px-3 text-gray-200 text-sm">{userItem.prenom || 'N/A'}</TableCell>
                <TableCell className="py-3 px-3 text-gray-200 text-sm">{userItem.email || 'N/A'}</TableCell>
                <TableCell className="py-3 px-3 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${userItem.role === 'Admin' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'}`}>
                        {userItem.role || 'N/A'}
                    </span>
                </TableCell>
                <TableCell className="py-3 px-3 text-gray-300 text-sm">
                  {userItem.date_creation ? 
                    new Date(userItem.date_creation).toLocaleDateString('fr-FR', { 
                      year: 'numeric', month: '2-digit', day: '2-digit' 
                    }) : 'N/A'}
                </TableCell>
                <TableCell className="text-right space-x-2 py-3 px-3">
                  <Button
                    className='bg-amber-600 hover:bg-amber-500 text-white text-xs px-3 py-1.5'
                    size="sm"
                    onClick={() => handleEditUser(userItem)}
                    disabled={isLoading} 
                  >
                    Modifier
                  </Button>
                  <Button
                    className='bg-[#e30e1b] hover:bg-[#c50d18] text-white text-xs px-3 py-1.5'
                    size="sm"
                    onClick={() => handleDeleteUser(userItem.id)}
                    disabled={isLoading || (currentAdmin?.id === userItem.id)}
                  >
                    Supprimer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && !isLoading && (
                <TableRow><TableCell colSpan={7} className="text-center text-gray-400 py-10">Aucun utilisateur trouvé.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modale d'ajout/modification d'utilisateur */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-gray-900 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">{isEditing ? 'Modifier l\'utilisateur' : 'Ajouter un nouvel utilisateur'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
            <div><Label htmlFor="prenom">Prénom</Label><Input id="prenom" name="prenom" value={currentUserData.prenom || ''} onChange={handleInputChange} className="bg-gray-800 border-gray-600" required /></div>
            <div><Label htmlFor="nom">Nom</Label><Input id="nom" name="nom" value={currentUserData.nom || ''} onChange={handleInputChange} className="bg-gray-800 border-gray-600" required /></div>
            <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" value={currentUserData.email || ''} onChange={handleInputChange} className="bg-gray-800 border-gray-600" required /></div>
            <div><Label htmlFor="password">Mot de passe {isEditing && "(Laisser vide pour ne pas changer)"}</Label><Input id="password" name="password" type="password" placeholder={isEditing ? "Nouveau mot de passe (optionnel)" : "Mot de passe"} value={currentUserData.password || ''} onChange={handleInputChange} className="bg-gray-800 border-gray-600" required={!isEditing} /></div>
            <div>
              <Label htmlFor="role">Rôle</Label>
              <Select name="role" value={currentUserData.role || 'Utilisateur'} onValueChange={handleRoleChange}>
                <SelectTrigger className="bg-gray-800 border-gray-600"><SelectValue placeholder="Sélectionner un rôle" /></SelectTrigger>
                <SelectContent className="bg-gray-800 text-white border-gray-700"><SelectItem value="Utilisateur">Utilisateur</SelectItem><SelectItem value="Admin">Admin</SelectItem></SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>} {/* Afficher l'erreur du formulaire ici */}
            <DialogFooter className="sm:justify-start pt-2">
              <DialogClose asChild><Button type="button" variant="outline" className="border-gray-600 text-black hover:bg-gray-700 hover:text-white" disabled={isSubmitting}>Annuler</Button></DialogClose>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-500" disabled={isSubmitting}>{isSubmitting ? (isEditing ? "Sauvegarde..." : "Ajout...") : (isEditing ? "Sauvegarder" : "Ajouter")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;