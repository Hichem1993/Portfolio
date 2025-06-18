// src/app/api/sous-categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Interface pour les données d'une sous-catégorie
// Inclut les infos de la catégorie parente pour l'affichage
export interface SubCategoryData extends RowDataPacket {
  id: number;
  nom: string;
  slugs: string;
  id_categorie: number;
  nom_categorie?: string; // Nom de la catégorie parente (via jointure)
  date_creation: Date | string;
}

// GET /api/sous-categories - Lister toutes les sous-catégories avec leur catégorie parente
export async function GET(req: NextRequest) {
  console.log("API GET /api/sous-categories: Requête reçue.");
  try {
    // TODO: Sécuriser (admin uniquement)
    const [subCategories] = await db.execute<SubCategoryData[]>(
      `SELECT sc.id, sc.nom, sc.slugs, sc.id_categorie, c.nom as nom_categorie, sc.date_creation 
       FROM sous_categorie sc
       JOIN categories c ON sc.id_categorie = c.id
       ORDER BY c.nom ASC, sc.nom ASC`
    );
    console.log(`API GET /api/sous-categories: ${subCategories.length} sous-catégories trouvées.`);
    return NextResponse.json(subCategories);
  } catch (error) {
    console.error('Erreur API GET /api/sous-categories:', error);
    return NextResponse.json({ error: 'Erreur serveur (GET sous-catégories).' }, { status: 500 });
  }
}

// POST /api/sous-categories - Créer une nouvelle sous-catégorie
export async function POST(req: NextRequest) {
  console.log("API POST /api/sous-categories: Requête reçue.");
  try {
    // TODO: Sécuriser (admin uniquement)
    const body = await req.json();
    const { nom, slugs, id_categorie } = body;
    console.log("API POST /api/sous-categories: Body:", body);

    if (!nom || !slugs || !id_categorie) {
      return NextResponse.json({ error: 'Nom, slug et ID de catégorie sont requis.' }, { status: 400 });
    }
    if (isNaN(parseInt(id_categorie, 10))) {
        return NextResponse.json({ error: 'ID de catégorie doit être un nombre.' }, { status: 400 });
    }

    // Vérifier doublons (nom/slug au sein d'une même catégorie parente, ou slug globalement unique)
    // Pour simplifier, on vérifie juste le slug global pour l'instant
    const [existingBySlug] = await db.execute<RowDataPacket[]>('SELECT id FROM sous_categorie WHERE slugs = ?', [slugs]);
    if (existingBySlug.length > 0) {
      return NextResponse.json({ error: 'Une sous-catégorie avec ce slug existe déjà.' }, { status: 409 });
    }

    const [result] = await db.execute<ResultSetHeader>(
      'INSERT INTO sous_categorie (nom, slugs, id_categorie) VALUES (?, ?, ?)',
      [nom, slugs, id_categorie]
    );
    const newSubCategoryId = result.insertId;

    // Récupérer la nouvelle sous-catégorie avec le nom de sa catégorie parente
    const [newSubCategoryRows] = await db.execute<SubCategoryData[]>(
        `SELECT sc.id, sc.nom, sc.slugs, sc.id_categorie, c.nom as nom_categorie, sc.date_creation 
         FROM sous_categorie sc
         JOIN categories c ON sc.id_categorie = c.id
         WHERE sc.id = ?`, 
        [newSubCategoryId]
    );
    if (newSubCategoryRows.length === 0) throw new Error("Sous-catégorie créée mais non récupérable.");

    return NextResponse.json({ success: true, message: 'Sous-catégorie ajoutée.', subCategory: newSubCategoryRows[0] }, { status: 201 });
  } catch (error) {
    console.error('Erreur API POST /api/sous-categories:', error);
    return NextResponse.json({ error: 'Erreur serveur (POST sous-catégorie).' }, { status: 500 });
  }
}