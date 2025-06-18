// src/components/Dashboard/CategoryManagement.tsx
"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
// Shadcn/UI imports
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Interface pour une catégorie
interface Category {
  id: number;
  nom: string;
  slugs: string;
  date_creation: string; 
}

// État initial pour le formulaire
const initialCategoryState: Omit<Category, 'id' | 'date_creation'> = {
  nom: '',
  slugs: '',
};

// Déclaration du composant SANS 'export' ici
const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategoryData, setCurrentCategoryData] = useState(initialCategoryState);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => { 
    setIsLoading(true); setError(null); setFormError(null);
    try { 
      const response = await fetch('/api/categories');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({error: "Erreur API non JSON"}));
        throw new Error(errorData.error || 'Échec de la récupération des catégories');
      }
      const data: Category[] = await response.json();
      setCategories(data);
    } catch (err:any) { setError(err.message); setCategories([]); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAddCategory = () => {
    setIsEditing(false);
    setCurrentCategoryData(initialCategoryState);
    setEditingCategoryId(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setIsEditing(true);
    setCurrentCategoryData({ nom: category.nom, slugs: category.slugs });
    setEditingCategoryId(category.id);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la catégorie ID ${categoryId} ?`)) {
      setIsLoading(true); 
      try {
        const response = await fetch(`/api/categories/${categoryId}`, { method: 'DELETE' });
        const result = await response.json();
        if (!response.ok) { throw new Error(result.error || 'Échec de la suppression.'); }
        alert("Catégorie supprimée !");
        fetchCategories(); 
      } catch (err: any) { alert(`Erreur: ${err.message}`); } 
      finally { setIsLoading(false); }
    }
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true); setFormError(null);

    const url = isEditing && editingCategoryId ? `/api/categories/${editingCategoryId}` : '/api/categories';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentCategoryData),
      });
      const result = await response.json();
      if (!response.ok) { throw new Error(result.error || `Échec de ${isEditing ? 'la mise à jour' : 'l\'ajout'}.`); }
      alert(`Catégorie ${isEditing ? 'mise à jour' : 'ajoutée'} !`);
      setIsModalOpen(false);
      fetchCategories(); 
    } catch (err: any) { setFormError(err.message); } 
    finally { setIsSubmitting(false); }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'nom') {
      const slugValue = value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      setCurrentCategoryData(prev => ({ ...prev, nom: value, slugs: slugValue }));
    } else {
      setCurrentCategoryData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (isLoading && categories.length === 0) { return <div className="text-center py-10 text-white">Chargement des catégories...</div>; }
  if (error && categories.length === 0) { return <div className="text-center text-[#e30e1b] py-10">Erreur: {error}</div>; }

  return (
    <div className="bg-gray-800/30 p-4 md:p-6 rounded-lg border border-gray-700/50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Gestion des Catégories</h1>
        <Button className='bg-white text-black hover:bg-gray-200' onClick={handleAddCategory} >
          Ajouter une catégorie
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="border-b border-gray-700">
              <TableHead className='text-white'>ID</TableHead>
              <TableHead className='text-white'>Nom</TableHead>
              <TableHead className='text-white'>Slug</TableHead>
              <TableHead className='text-white'>Date Création</TableHead>
              <TableHead className="text-right text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                <TableCell>{category.id}</TableCell>
                <TableCell>{category.nom}</TableCell>
                <TableCell>{category.slugs}</TableCell>
                <TableCell>
                  {category.date_creation ? new Date(category.date_creation).toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'N/A'}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button className='bg-amber-600 hover:bg-amber-500' size="sm" onClick={() => handleEditCategory(category)}>Modifier</Button>
                  <Button className='bg-[#e30e1b] hover:bg-[#c50d18]' size="sm" onClick={() => handleDeleteCategory(category.id)}>Supprimer</Button>
                </TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && !isLoading && ( <TableRow><TableCell colSpan={5} className="text-center text-gray-400 py-10">Aucune catégorie trouvée.</TableCell></TableRow> )}
          </TableBody>
        </Table>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-gray-900 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">{isEditing ? 'Modifier la Catégorie' : 'Ajouter une Catégorie'}</DialogTitle>
            <DialogDescription className="text-gray-400">Remplissez les informations. Le slug est auto-généré.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
            <div><Label htmlFor="nom" className="text-gray-300">Nom</Label><Input id="nom" name="nom" value={currentCategoryData.nom} onChange={handleInputChange} className="bg-gray-800 border-gray-600 mt-1" required /></div>
            <div><Label htmlFor="slugs" className="text-gray-300">Slug</Label><Input id="slugs" name="slugs" value={currentCategoryData.slugs} onChange={handleInputChange} className="bg-gray-800 border-gray-600 mt-1" required /></div>
            {formError && <p className="text-sm text-red-400">{formError}</p>}
            <DialogFooter className="sm:justify-start pt-4">
              <DialogClose asChild><Button type="button" variant="outline" className="border-gray-600 hover:bg-gray-700" disabled={isSubmitting}>Annuler</Button></DialogClose>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-500" disabled={isSubmitting}>{isSubmitting ? "Sauvegarde..." : "Sauvegarder"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Exportation par défaut du composant
export default CategoryManagement; 