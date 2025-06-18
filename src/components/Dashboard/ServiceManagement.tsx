// src/components/Dashboard/ServiceManagement.tsx
"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CategoryData } from '@/app/api/categories/route'; 
import { SubCategoryData } from '@/app/api/sous-categories/route'; 
import { cn } from '@/lib/utils';

// Interface pour un service dans ce composant admin
interface ServiceAdminItem {
  id: number;
  nom: string;
  slugs: string;
  description: string;
  prix: number; 
  image_url: string | null;
  est_disponible: boolean;
  id_sous_categorie: number;
  nom_sous_categorie?: string;
  nom_categorie?: string;
  date_creation: string;
}

// État initial du formulaire
const initialServiceState: {
  nom: string;
  slugs: string;
  description: string;
  prix: string; 
  image_url: string;
  est_disponible: boolean;
  id_sous_categorie: string; 
} = {
  nom: '',
  slugs: '',
  description: '',
  prix: '',
  image_url: '',
  est_disponible: true,
  id_sous_categorie: '',
};


const ServiceManagement = () => {
  const [services, setServices] = useState<ServiceAdminItem[]>([]);
  const [mainCategories, setMainCategories] = useState<CategoryData[]>([]);
  const [allSubCategories, setAllSubCategories] = useState<SubCategoryData[]>([]);
  const [filteredSubCategoriesForForm, setFilteredSubCategoriesForForm] = useState<SubCategoryData[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentServiceData, setCurrentServiceData] = useState(initialServiceState);
  const [isEditing, setIsEditing] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedMainCategoryInForm, setSelectedMainCategoryInForm] = useState<string>('');

  const fetchData = async () => {
    setIsLoading(true); setError(null); setFormError(null);
    try {
      const [servicesRes, mainCatsRes, subCatsRes] = await Promise.all([
        fetch('/api/services-crud'),
        fetch('/api/categories'),
        fetch('/api/sous-categories')
      ]);
      if (!servicesRes.ok) throw new Error(`Échec récupération services: ${await servicesRes.text()}`);
      if (!mainCatsRes.ok) throw new Error(`Échec récupération catégories: ${await mainCatsRes.text()}`);
      if (!subCatsRes.ok) throw new Error(`Échec récupération sous-catégories: ${await subCatsRes.text()}`);

      const servicesData = await servicesRes.json();
      const mainCatsData: CategoryData[] = await mainCatsRes.json();
      const subCatsData: SubCategoryData[] = await subCatsRes.json();

      setServices(servicesData.map((s:any) => ({...s, prix: parseFloat(s.prix), est_disponible: Boolean(s.est_disponible) })));
      setMainCategories(mainCatsData);
      setAllSubCategories(subCatsData);
      console.log("ServiceManagement: Données chargées", { numServices: servicesData.length, numMainCats: mainCatsData.length, numSubCats: subCatsData.length });
    } catch (err: any) { 
        console.error("ServiceManagement: Erreur dans fetchData:", err);
        setError(err.message); 
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (selectedMainCategoryInForm) {
      const catId = parseInt(selectedMainCategoryInForm, 10);
      setFilteredSubCategoriesForForm(allSubCategories.filter(sc => sc.id_categorie === catId));
      // Si la sous-catégorie actuellement sélectionnée (currentServiceData.id_sous_categorie)
      // n'appartient pas à la nouvelle catégorie principale sélectionnée, la réinitialiser.
      const currentSubCatIdNum = parseInt(currentServiceData.id_sous_categorie, 10);
      const currentSubCat = allSubCategories.find(sc => sc.id === currentSubCatIdNum);
      if (currentSubCat && currentSubCat.id_categorie !== catId) {
          setCurrentServiceData(prev => ({ ...prev, id_sous_categorie: '' }));
      }
    } else {
      setFilteredSubCategoriesForForm([]);
      // Optionnel : si aucune catégorie principale n'est sélectionnée, vider aussi la sous-catégorie sélectionnée.
      // setCurrentServiceData(prev => ({ ...prev, id_sous_categorie: '' }));
    }
  }, [selectedMainCategoryInForm, allSubCategories, currentServiceData.id_sous_categorie]);


  const handleAdd = () => {
    setIsEditing(false);
    setCurrentServiceData(initialServiceState);
    setEditingServiceId(null);
    setSelectedMainCategoryInForm(''); 
    setFilteredSubCategoriesForForm([]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (service: ServiceAdminItem) => {
    setIsEditing(true);
    const subCatParentInfo = allSubCategories.find(sc => sc.id === service.id_sous_categorie);
    const mainCatIdForForm = subCatParentInfo ? subCatParentInfo.id_categorie.toString() : '';
    
    setSelectedMainCategoryInForm(mainCatIdForForm); 
    
    setCurrentServiceData({ 
        nom: service.nom, 
        slugs: service.slugs,
        description: service.description,
        prix: service.prix.toString(), 
        image_url: service.image_url || '',
        est_disponible: service.est_disponible,
        id_sous_categorie: service.id_sous_categorie.toString()
    });
    setEditingServiceId(service.id);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (serviceId: number) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le service ID ${serviceId} ?`)) {
      //setIsLoading(true); // Mettre un état de chargement spécifique si besoin
      setIsSubmitting(true); // Réutiliser pour le feedback sur les boutons
      try {
        const response = await fetch(`/api/services-crud/${serviceId}`, { method: 'DELETE' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Échec de la suppression du service.');
        alert("Service supprimé avec succès !");
        fetchData();
      } catch (err: any) { 
        alert(`Erreur lors de la suppression: ${err.message}`); 
        console.error("ServiceManagement - Erreur handleDelete:", err);
      }
      finally { 
        //setIsLoading(false); 
        setIsSubmitting(false);
      }
    }
  };
  
  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    if (!currentServiceData.id_sous_categorie) {
        setFormError("Veuillez sélectionner une catégorie principale PUIS une sous-catégorie.");
        return;
    }
    const prixNum = parseFloat(currentServiceData.prix);
    if (isNaN(prixNum) || prixNum < 0) {
        setFormError("Veuillez entrer un prix valide (nombre positif).");
        return;
    }

    setIsSubmitting(true); setFormError(null);

    const url = isEditing && editingServiceId ? `/api/services-crud/${editingServiceId}` : '/api/services-crud';
    const method = isEditing ? 'PUT' : 'POST';
    
    const payload = {
        nom: currentServiceData.nom,
        slugs: currentServiceData.slugs,
        description: currentServiceData.description,
        prix: prixNum, 
        image_url: currentServiceData.image_url || null,
        est_disponible: currentServiceData.est_disponible,
        id_sous_categorie: parseInt(currentServiceData.id_sous_categorie, 10) 
    };
    console.log("ServiceManagement - handleFormSubmit: Envoi payload:", payload);

    try {
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `Échec ${isEditing ? 'de la mise à jour' : 'de l\'ajout'}.`);
      alert(`Service ${isEditing ? 'mis à jour' : 'ajouté'} !`);
      setIsModalOpen(false); fetchData();
    } catch (err: any) { 
        setFormError(err.message); 
        console.error("ServiceManagement - Erreur handleFormSubmit:", err);
    } 
    finally { setIsSubmitting(false); }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentServiceData(prevData => {
      const newData = { ...prevData, [name]: value };
      if (name === 'nom' && !isEditing) { // Auto-générer slug seulement à la création pour le champ nom
        const slugValue = value.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/--+/g, '-');
        newData.slugs = slugValue;
      }
      return newData;
    });
  };

  const handleCheckboxChange = (checked: boolean | 'indeterminate') => {
    if (typeof checked === 'boolean') {
      setCurrentServiceData(prev => ({ ...prev, est_disponible: checked }));
    }
  };
  
  const handleMainCategorySelectForForm = (value: string) => { // value est l'ID de la catégorie principale (string)
    setSelectedMainCategoryInForm(value);
    // Le useEffect dépendant de selectedMainCategoryInForm s'occupera de filtrer les sous-catégories
    // et de réinitialiser id_sous_categorie dans currentServiceData si nécessaire.
  };
  const handleSubCategorySelectForForm = (value: string) => { // value est l'ID de la sous-catégorie (string)
    setCurrentServiceData(prev => ({ ...prev, id_sous_categorie: value }));
  };

  // Affichage des états de chargement / erreur
  if (isLoading && services.length === 0 && mainCategories.length === 0 && allSubCategories.length === 0) { 
    return <div className="text-center py-10 text-white">Chargement des données initiales...</div>; 
  }
  if (error) { 
    return <div className="text-center text-[#e30e1b] py-10">Erreur de chargement des données: {error}</div>; 
  }

  return (
    <div className="bg-gray-800/30 p-4 md:p-6 rounded-lg border border-gray-700/50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Gestion des Services</h1>
        <Button className='bg-white text-black hover:bg-gray-200' onClick={handleAdd}>Ajouter un Service</Button>
      </div>
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="border-b border-gray-700">
              <TableHead className='text-white'>ID</TableHead>
              <TableHead className='text-white'>Nom</TableHead>
              <TableHead className='text-white'>Prix</TableHead>
              <TableHead className='text-white'>Sous-Cat.</TableHead>
              <TableHead className='text-white'>Cat. Principale</TableHead>
              <TableHead className='text-white'>Dispo.</TableHead>
              <TableHead className="text-right text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                <TableCell className="text-gray-300">{service.id}</TableCell>
                <TableCell className="font-medium text-gray-100">{service.nom}</TableCell>
                <TableCell className="text-gray-300">{service.prix.toFixed(2)} €</TableCell>
                <TableCell className="text-gray-300">{service.nom_sous_categorie || `ID: ${service.id_sous_categorie}`}</TableCell>
                <TableCell className="text-gray-300">{service.nom_categorie || 'N/A'}</TableCell>
                <TableCell className="text-gray-300">
                    <span className={cn("px-2 py-0.5 rounded-full text-xs", service.est_disponible ? 'bg-green-600 text-green-100' : 'bg-gray-600 text-gray-300')}>
                        {service.est_disponible ? 'Oui' : 'Non'}
                    </span>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button className='bg-amber-600 hover:bg-amber-500 text-white text-xs px-3 py-1.5' size="sm" onClick={() => handleEdit(service)}>Modifier</Button>
                  <Button className='bg-[#e30e1b] hover:bg-[#c50d18] text-white text-xs px-3 py-1.5' size="sm" onClick={() => handleDelete(service.id)}>Supprimer</Button>
                </TableCell>
              </TableRow>
            ))}
            {services.length === 0 && !isLoading && ( <TableRow><TableCell colSpan={7} className="text-center text-gray-400 py-10">Aucun service trouvé.</TableCell></TableRow> )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg bg-gray-900 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">{isEditing ? 'Modifier le Service' : 'Ajouter un Nouveau Service'}</DialogTitle>
            <DialogDescription className="text-gray-400">
              Remplissez tous les champs requis. Le slug peut être auto-généré à partir du nom lors de l'ajout.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-3 pt-2 max-h-[70vh] overflow-y-auto pr-2 pb-4"> {/* Scrollable content */}
            <div><Label htmlFor="nom" className="text-gray-300">Nom du Service</Label><Input id="nom" name="nom" value={currentServiceData.nom} onChange={handleInputChange} className="bg-gray-800 border-gray-600 mt-1" required /></div>
            <div><Label htmlFor="slugs" className="text-gray-300">Slug</Label><Input id="slugs" name="slugs" value={currentServiceData.slugs} onChange={handleInputChange} className="bg-gray-800 border-gray-600 mt-1" required /></div>
            <div><Label htmlFor="description" className="text-gray-300">Description</Label><Textarea id="description" name="description" value={currentServiceData.description} onChange={handleInputChange} rows={3} className="bg-gray-800 border-gray-600 mt-1" required /></div>
            <div><Label htmlFor="prix" className="text-gray-300">Prix (€)</Label><Input id="prix" name="prix" type="number" step="0.01" min="0" value={currentServiceData.prix} onChange={handleInputChange} className="bg-gray-800 border-gray-600 mt-1" required /></div>
            <div><Label htmlFor="image_url" className="text-gray-300">URL de l'image (optionnel)</Label><Input id="image_url" name="image_url" value={currentServiceData.image_url || ''} onChange={handleInputChange} className="bg-gray-800 border-gray-600 mt-1" /></div>
            
            <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="est_disponible" name="est_disponible" checked={currentServiceData.est_disponible} onCheckedChange={handleCheckboxChange} className="border-gray-600 data-[state=checked]:bg-[#e30e1b] data-[state=checked]:border-[#e30e1b]" />
                <Label htmlFor="est_disponible" className="text-sm font-medium text-gray-300 leading-none">Service Disponible</Label>
            </div>

            <div>
              <Label htmlFor="main_category_form" className="text-gray-300">Catégorie Principale</Label>
              <Select name="main_category_form" value={selectedMainCategoryInForm} onValueChange={handleMainCategorySelectForForm} required>
                <SelectTrigger className="bg-gray-800 border-gray-600 mt-1"><SelectValue placeholder="Choisir une catégorie principale" /></SelectTrigger>
                <SelectContent className="bg-gray-800 text-white border-gray-700">{mainCategories.map(cat => <SelectItem key={cat.id} value={cat.id.toString()}>{cat.nom}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="id_sous_categorie" className="text-gray-300">Sous-Catégorie</Label>
              <Select name="id_sous_categorie" value={currentServiceData.id_sous_categorie} onValueChange={handleSubCategorySelectForForm} required disabled={!selectedMainCategoryInForm || filteredSubCategoriesForForm.length === 0}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 mt-1"><SelectValue placeholder={!selectedMainCategoryInForm ? "Choisissez d'abord une catégorie principale" : (filteredSubCategoriesForForm.length === 0 ? "Aucune sous-catégorie disponible" : "Choisir une sous-catégorie")} /></SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white border-gray-700">
                  {filteredSubCategoriesForForm.map(subCat => <SelectItem key={subCat.id} value={subCat.id.toString()}>{subCat.nom}</SelectItem>)}
                  </SelectContent>
              </Select>
            </div>

            {formError && <p className="text-sm text-red-400 pt-1">{formError}</p>}
            <DialogFooter className="sm:justify-start pt-4">
              <DialogClose asChild><Button type="button" variant="outline" className="border-gray-600 hover:bg-gray-700" disabled={isSubmitting}>Annuler</Button></DialogClose>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-500" disabled={isSubmitting}>{isSubmitting ? (isEditing ? "Sauvegarde..." : "Ajout...") : (isEditing ? "Sauvegarder les Modifications" : "Ajouter le Service")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default ServiceManagement;