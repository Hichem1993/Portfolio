// src/components/Dashboard/SubCategoryManagement.tsx
"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryData } from '@/app/api/categories/route'; // Importer l'interface depuis l'API des catégories

// Interface pour une sous-catégorie (inclut nom_categorie pour l'affichage)
interface SubCategory {
  id: number;
  nom: string;
  slugs: string;
  id_categorie: number; // Sera un nombre dans l'état final et pour l'API
  nom_categorie?: string; 
  date_creation: string;
}

// État initial pour le formulaire. id_categorie est string ici pour le composant Select.
const initialSubCategoryState: { nom: string; slugs: string; id_categorie: string } = {
  nom: '',
  slugs: '',
  id_categorie: '', 
};


const SubCategoryManagement = () => {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [mainCategories, setMainCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSubCategoryData, setCurrentSubCategoryData] = useState(initialSubCategoryState);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSubCategoryId, setEditingSubCategoryId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true); setError(null); setFormError(null);
    try {
      const [subCatsRes, mainCatsRes] = await Promise.all([
        fetch('/api/sous-categories'),
        fetch('/api/categories')
      ]);

      if (!subCatsRes.ok) {
        const err = await subCatsRes.json().catch(()=>({}));
        throw new Error(err.error || 'Échec de la récupération des sous-catégories');
      }
      if (!mainCatsRes.ok) {
        const err = await mainCatsRes.json().catch(()=>({}));
        throw new Error(err.error || 'Échec de la récupération des catégories principales');
      }

      const subCatsData: SubCategory[] = await subCatsRes.json();
      const mainCatsData: CategoryData[] = await mainCatsRes.json();
      
      setSubCategories(subCatsData);
      setMainCategories(mainCatsData);
      console.log("SubCategoryManagement: Données chargées:", { subCatsData, mainCatsData });

    } catch (err: any) { 
        console.error("SubCategoryManagement: Erreur dans fetchData:", err);
        setError(err.message); setSubCategories([]); setMainCategories([]); 
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = () => {
    setIsEditing(false);
    setCurrentSubCategoryData(initialSubCategoryState);
    setEditingSubCategoryId(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (subCategory: SubCategory) => {
    setIsEditing(true);
    setCurrentSubCategoryData({ 
        nom: subCategory.nom, 
        slugs: subCategory.slugs, 
        id_categorie: subCategory.id_categorie.toString() // Convertir en string pour le Select
    });
    setEditingSubCategoryId(subCategory.id);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (subCategoryId: number) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la sous-catégorie ID ${subCategoryId} ?`)) {
      setIsLoading(true); // Ou un état spécifique isDeleting
      try {
        const response = await fetch(`/api/sous-categories/${subCategoryId}`, { method: 'DELETE' });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Échec de la suppression de la sous-catégorie.');
        }
        alert("Sous-catégorie supprimée avec succès !");
        fetchData(); // Recharger la liste
      } catch (err: any) {
        alert(`Erreur lors de la suppression: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    if (!currentSubCategoryData.id_categorie) { // Vérification que la catégorie parente est sélectionnée
        setFormError("Veuillez sélectionner une catégorie parente.");
        return;
    }
    setIsSubmitting(true); setFormError(null);

    const url = isEditing && editingSubCategoryId ? `/api/sous-categories/${editingSubCategoryId}` : '/api/sous-categories';
    const method = isEditing ? 'PUT' : 'POST';
    
    // S'assurer que id_categorie est un nombre avant l'envoi
    const payload = {
        ...currentSubCategoryData,
        id_categorie: parseInt(currentSubCategoryData.id_categorie, 10) 
    };

    console.log(`SubCategoryManagement - handleFormSubmit: Envoi vers ${url} avec payload:`, payload);

    try {
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `Échec opération (${method}).`);
      alert(`Sous-catégorie ${isEditing ? 'mise à jour' : 'ajoutée'} !`);
      setIsModalOpen(false); fetchData();
    } catch (err: any) { 
        console.error("SubCategoryManagement - Erreur handleFormSubmit:", err);
        setFormError(err.message); 
    } finally { setIsSubmitting(false); }
  };

  // DÉCOMMENTER ET COMPLÉTER handleInputChange
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`SubCategoryManagement - handleInputChange: name=${name}, value=${value}`);
    
    setCurrentSubCategoryData(prevData => {
      const newData = { ...prevData, [name]: value };
      // Auto-générer le slug si le champ 'nom' est modifié et que le champ 'slugs' est vide ou auto-généré précédemment
      if (name === 'nom') {
        const slugValue = value
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '') // Supprimer caractères spéciaux sauf espaces et tirets
          .replace(/\s+/g, '-')     // Remplacer les espaces par des tirets
          .replace(/--+/g, '-');    // Remplacer les tirets multiples par un seul
        newData.slugs = slugValue;
      }
      return newData;
    });
  };

  const handleCategorySelectChange = (value: string) => { // value est l'ID de la catégorie en string
    console.log("SubCategoryManagement - handleCategorySelectChange: value=", value);
    setCurrentSubCategoryData(prev => ({ ...prev, id_categorie: value }));
  };


  if (isLoading && subCategories.length === 0 && mainCategories.length === 0) { 
    return <div className="text-center py-10 text-white">Chargement des données...</div>; 
  }
  if (error) { 
    return <div className="text-center text-[#e30e1b] py-10">Erreur: {error}</div>; 
  }

  return (
    <div className="bg-gray-800/30 p-4 md:p-6 rounded-lg border border-gray-700/50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Gestion des Sous-Catégories</h1>
        <Button className='bg-white text-black hover:bg-gray-200' onClick={handleAdd}>Ajouter une Sous-Catégorie</Button>
      </div>
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="border-b border-gray-700">
              <TableHead className='text-white'>ID</TableHead>
              <TableHead className='text-white'>Nom Sous-Catégorie</TableHead>
              <TableHead className='text-white'>Slug</TableHead>
              <TableHead className='text-white'>Catégorie Parente</TableHead>
              <TableHead className='text-white'>Date Création</TableHead>
              <TableHead className="text-right text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subCategories.map((sc) => (
              <TableRow key={sc.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                <TableCell className="text-gray-300">{sc.id}</TableCell>
                <TableCell className="text-gray-200">{sc.nom}</TableCell>
                <TableCell className="text-gray-200">{sc.slugs}</TableCell>
                <TableCell className="text-gray-300">{sc.nom_categorie || `ID: ${sc.id_categorie}`}</TableCell>
                <TableCell className="text-gray-300">{sc.date_creation ? new Date(sc.date_creation).toLocaleDateString('fr-FR', {year: '2-digit', month: '2-digit', day: '2-digit'}) : 'N/A'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button className='bg-amber-600 hover:bg-amber-500 text-xs px-3 py-1.5' size="sm" onClick={() => handleEdit(sc)}>Modifier</Button>
                  <Button className='bg-[#e30e1b] hover:bg-[#c50d18] text-xs px-3 py-1.5' size="sm" onClick={() => handleDelete(sc.id)}>Supprimer</Button>
                </TableCell>
              </TableRow>
            ))}
            {subCategories.length === 0 && !isLoading && ( <TableRow><TableCell colSpan={6} className="text-center text-gray-400 py-10">Aucune sous-catégorie trouvée.</TableCell></TableRow> )}
          </TableBody>
        </Table>
      </div>

      {/* Modale d'ajout/modification */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-gray-900 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">{isEditing ? 'Modifier la Sous-Catégorie' : 'Ajouter une Nouvelle Sous-Catégorie'}</DialogTitle>
            <DialogDescription className="text-gray-400">
              Remplissez les informations. Le slug peut être auto-généré à partir du nom.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
            <div>
              <Label htmlFor="nom" className="text-gray-300">Nom de la Sous-Catégorie</Label>
              <Input id="nom" name="nom" value={currentSubCategoryData.nom} onChange={handleInputChange} className="bg-gray-800 border-gray-600 mt-1" required />
            </div>
            <div>
              <Label htmlFor="slugs" className="text-gray-300">Slug</Label>
              <Input id="slugs" name="slugs" value={currentSubCategoryData.slugs} onChange={handleInputChange} className="bg-gray-800 border-gray-600 mt-1" required placeholder="Ex: creation-logo"/>
            </div>
            <div>
              <Label htmlFor="id_categorie" className="text-gray-300">Catégorie Parente</Label>
              <Select name="id_categorie" value={currentSubCategoryData.id_categorie} onValueChange={handleCategorySelectChange} required>
                <SelectTrigger className="bg-gray-800 border-gray-600 mt-1"><SelectValue placeholder="Choisir une catégorie parente" /></SelectTrigger>
                <SelectContent className="bg-gray-800 text-white border-gray-700">
                  {mainCategories.length === 0 && <SelectItem value="" disabled>Aucune catégorie principale disponible</SelectItem>}
                  {mainCategories.map(cat => <SelectItem key={cat.id} value={cat.id.toString()}>{cat.nom}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {formError && <p className="text-sm text-red-400 pt-1">{formError}</p>}
            <DialogFooter className="sm:justify-start pt-4">
              <DialogClose asChild><Button type="button" variant="outline" className="border-gray-600 text-black hover:text-white hover:bg-gray-700" disabled={isSubmitting}>Annuler</Button></DialogClose>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-500" disabled={isSubmitting}>{isSubmitting ? (isEditing ? "Sauvegarde..." : "Ajout...") : (isEditing ? "Sauvegarder" : "Ajouter")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubCategoryManagement;