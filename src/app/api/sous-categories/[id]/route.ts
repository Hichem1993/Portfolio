// src/app/api/sous-categories/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { SubCategoryData } from '../route'; // Importer l'interface depuis le fichier parent

// PUT /api/sous-categories/[id] - Modifier une sous-catégorie
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const subCategoryId = parseInt(params.id, 10);
  if (isNaN(subCategoryId)) return NextResponse.json({ error: 'ID invalide.' }, { status: 400 });
  console.log(`API PUT /api/sous-categories/${subCategoryId}: Requête reçue.`);
  try {
    // TODO: Sécuriser
    const body = await req.json();
    const { nom, slugs, id_categorie } = body;
    if (!nom || !slugs || !id_categorie || isNaN(parseInt(id_categorie, 10))) {
      return NextResponse.json({ error: 'Nom, slug et ID de catégorie valide sont requis.' }, { status: 400 });
    }

    // Vérifier doublon de slug (excluant l'actuelle)
    const [existingBySlug] = await db.execute<RowDataPacket[]>('SELECT id FROM sous_categorie WHERE slugs = ? AND id != ?', [slugs, subCategoryId]);
    if (existingBySlug.length > 0) return NextResponse.json({ error: 'Ce slug est déjà utilisé par une autre sous-catégorie.' }, { status: 409 });
    
    const [result] = await db.execute<ResultSetHeader>(
      'UPDATE sous_categorie SET nom = ?, slugs = ?, id_categorie = ? WHERE id = ?',
      [nom, slugs, id_categorie, subCategoryId]
    );
    if (result.affectedRows === 0) return NextResponse.json({ error: 'Sous-catégorie non trouvée ou pas de modif.' }, { status: 404 });

    const [updatedSubCategoryRows] = await db.execute<SubCategoryData[]>(
        `SELECT sc.id, sc.nom, sc.slugs, sc.id_categorie, c.nom as nom_categorie, sc.date_creation 
         FROM sous_categorie sc
         JOIN categories c ON sc.id_categorie = c.id
         WHERE sc.id = ?`, 
        [subCategoryId]
    );
    return NextResponse.json({ success: true, message: 'Sous-catégorie mise à jour.', subCategory: updatedSubCategoryRows[0] });
  } catch (error) {
    console.error(`Erreur API PUT /api/sous-categories/${subCategoryId}:`, error);
    return NextResponse.json({ error: 'Erreur serveur (PUT sous-catégorie).' }, { status: 500 });
  }
}

// DELETE /api/sous-categories/[id] - Supprimer une sous-catégorie
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const subCategoryId = parseInt(params.id, 10);
  if (isNaN(subCategoryId)) return NextResponse.json({ error: 'ID invalide.' }, { status: 400 });
  console.log(`API DELETE /api/sous-categories/${subCategoryId}: Requête reçue.`);
  try {
    // TODO: Sécuriser
    // Vérifier si des services utilisent cette sous-catégorie
    const [linkedServices] = await db.execute<RowDataPacket[]>('SELECT id FROM services WHERE id_sous_categorie = ?', [subCategoryId]);
    if (linkedServices.length > 0) {
      return NextResponse.json({ error: `Impossible de supprimer: ${linkedServices.length} service(s) utilise(nt) cette sous-catégorie.` }, { status: 409 });
    }

    const [result] = await db.execute<ResultSetHeader>('DELETE FROM sous_categorie WHERE id = ?', [subCategoryId]);
    if (result.affectedRows === 0) return NextResponse.json({ error: 'Sous-catégorie non trouvée.' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Sous-catégorie supprimée.' });
  } catch (error) {
    console.error(`Erreur API DELETE /api/sous-categories/${subCategoryId}:`, error);
    // @ts-ignore
    if (error.code === 'ER_ROW_IS_REFERENCED_2') return NextResponse.json({ error: 'Impossible de supprimer: utilisée par des services.' }, { status: 409 });
    return NextResponse.json({ error: 'Erreur serveur (DELETE sous-catégorie).' }, { status: 500 });
  }
}