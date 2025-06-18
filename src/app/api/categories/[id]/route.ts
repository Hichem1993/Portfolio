// src/app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// Interface pour les données d'une catégorie (peut être importée si définie globalement)
interface CategoryData extends RowDataPacket {
  id: number;
  nom: string;
  slugs: string; 
  date_creation: Date | string;
}

// Fonction PUT pour modifier une catégorie existante
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const categoryId = parseInt(params.id, 10);
  if (isNaN(categoryId)) {
    return NextResponse.json({ error: 'ID de catégorie invalide.' }, { status: 400 });
  }
  console.log(`API PUT /api/categories/${categoryId}: Requête reçue.`);

  try {
    // TODO: Sécuriser cette route (admin uniquement)
    const body = await req.json();
    const { nom, slugs } = body;

    if (!nom || !slugs) {
      return NextResponse.json({ error: 'Le nom et le slug sont requis pour la mise à jour.' }, { status: 400 });
    }

    // Optionnel: Vérifier si le nouveau nom ou slug entre en conflit avec une autre catégorie (excluant l'actuelle)
    const [existingByName] = await db.execute<RowDataPacket[]>('SELECT id FROM categories WHERE nom = ? AND id != ?', [nom, categoryId]);
    if (existingByName.length > 0) {
      return NextResponse.json({ error: 'Une autre catégorie avec ce nom existe déjà.' }, { status: 409 });
    }
    const [existingBySlug] = await db.execute<RowDataPacket[]>('SELECT id FROM categories WHERE slugs = ? AND id != ?', [slugs, categoryId]);
    if (existingBySlug.length > 0) {
      return NextResponse.json({ error: 'Une autre catégorie avec ce slug existe déjà.' }, { status: 409 });
    }

    const [result] = await db.execute<ResultSetHeader>(
      'UPDATE categories SET nom = ?, slugs = ? WHERE id = ?',
      [nom, slugs, categoryId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Catégorie non trouvée ou aucune modification effectuée.' }, { status: 404 });
    }

    // Récupérer la catégorie mise à jour
    const [updatedCategoryRows] = await db.execute<CategoryData[]>("SELECT id, nom, slugs, date_creation FROM categories WHERE id = ?", [categoryId]);

    console.log(`API PUT /api/categories/${categoryId}: Catégorie mise à jour.`);
    return NextResponse.json({ success: true, message: 'Catégorie mise à jour avec succès.', category: updatedCategoryRows[0] });

  } catch (error) {
    console.error(`Erreur API PUT /api/categories/${categoryId}:`, error);
    return NextResponse.json({ error: 'Erreur serveur lors de la mise à jour de la catégorie.' }, { status: 500 });
  }
}

// Fonction DELETE pour supprimer une catégorie existante
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const categoryId = parseInt(params.id, 10);
  if (isNaN(categoryId)) {
    return NextResponse.json({ error: 'ID de catégorie invalide.' }, { status: 400 });
  }
  console.log(`API DELETE /api/categories/${categoryId}: Requête reçue.`);

  try {
    // TODO: Sécuriser cette route (admin uniquement)
    // ATTENTION: Gérer la suppression en cascade ou empêcher la suppression si des sous-catégories/services y sont liés.
    // Pour l'instant, suppression simple.
    // Alternative: Ajouter une colonne "est_supprime" (soft delete).

    // D'abord, vérifier si des sous-catégories utilisent cette catégorie
    const [linkedSubCategories] = await db.execute<RowDataPacket[]>('SELECT id FROM sous_categorie WHERE id_categorie = ?', [categoryId]);
    if (linkedSubCategories.length > 0) {
      return NextResponse.json({ error: `Impossible de supprimer: ${linkedSubCategories.length} sous-catégorie(s) utilise(nt) cette catégorie.` }, { status: 409 }); // Conflict
    }

    const [result] = await db.execute<ResultSetHeader>(
      'DELETE FROM categories WHERE id = ?',
      [categoryId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Catégorie non trouvée.' }, { status: 404 });
    }

    console.log(`API DELETE /api/categories/${categoryId}: Catégorie supprimée.`);
    return NextResponse.json({ success: true, message: 'Catégorie supprimée avec succès.' });

  } catch (error) {
    console.error(`Erreur API DELETE /api/categories/${categoryId}:`, error);
    // Gérer les erreurs de clé étrangère si la suppression est bloquée par la DB
    // @ts-ignore
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return NextResponse.json({ error: 'Impossible de supprimer cette catégorie car elle est utilisée par des sous-catégories ou services.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Erreur serveur lors de la suppression de la catégorie.' }, { status: 500 });
  }
}