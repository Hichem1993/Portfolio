// src/app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2'; // ResultSetHeader est important pour POST

// Interface pour les données d'une catégorie
// Assurez-vous que cette interface est cohérente avec ce que vous attendez/retournez.
export interface CategoryData extends RowDataPacket {
  id: number;
  nom: string;
  slugs: string; 
  date_creation: Date | string; // La DB retourne Date, JSON.stringify la convertit en string ISO
}

// Fonction GET (supposée correcte d'après vos tests précédents)
export async function GET(req: NextRequest) {
  console.log("API GET /api/categories: Requête reçue.");
  try {
    const [categoriesFromDB] = await db.execute<CategoryData[]>(
      'SELECT id, nom, slugs, date_creation FROM categories ORDER BY nom ASC'
    );
    console.log(`API GET /api/categories: ${categoriesFromDB.length} catégories trouvées.`);
    return NextResponse.json(categoriesFromDB);
  } catch (error) {
    console.error('--- ERREUR API GET /api/categories ---', error);
    return NextResponse.json({ error: 'Erreur serveur (GET catégories). Voir logs serveur.' }, { status: 500 });
  }
}

// Fonction POST pour créer une nouvelle catégorie
export async function POST(req: NextRequest) {
  console.log("API POST /api/categories: Requête reçue pour créer une catégorie.");
  try {
    const body = await req.json(); // Peut lever une erreur si le corps n'est pas du JSON valide
    const { nom, slugs } = body;
    console.log("API POST /api/categories: Body reçu:", body);

    if (!nom || typeof nom !== 'string' || nom.trim() === '' || 
        !slugs || typeof slugs !== 'string' || slugs.trim() === '') {
      console.log("API POST /api/categories: Nom ou slugs manquants ou invalides.");
      return NextResponse.json({ error: 'Le nom et le slug sont requis et ne peuvent pas être vides.' }, { status: 400 });
    }

    // Vérification des doublons (optionnel mais recommandé)
    const [existingByName] = await db.execute<RowDataPacket[]>('SELECT id FROM categories WHERE nom = ?', [nom.trim()]);
    if (existingByName.length > 0) {
      return NextResponse.json({ error: 'Une catégorie avec ce nom existe déjà.' }, { status: 409 });
    }
    const [existingBySlug] = await db.execute<RowDataPacket[]>('SELECT id FROM categories WHERE slugs = ?', [slugs.trim()]);
    if (existingBySlug.length > 0) {
      return NextResponse.json({ error: 'Une catégorie avec ce slug existe déjà.' }, { status: 409 });
    }

    // Insertion de la nouvelle catégorie
    // Si votre table 'categories' a une colonne 'date_creation' avec DEFAULT CURRENT_TIMESTAMP,
    // vous n'avez pas besoin de l'inclure dans l'INSERT.
    const query = 'INSERT INTO categories (nom, slugs) VALUES (?, ?)';
    const params = [nom.trim(), slugs.trim()];
    
    console.log("API POST /api/categories: Exécution SQL:", query, "avec params:", params);
    const [result] = await db.execute<ResultSetHeader>(query, params);
    
    if (result.affectedRows === 0 || !result.insertId) {
        console.error("API POST /api/categories: Échec de l'insertion, affectedRows = 0 ou pas d'insertId.");
        throw new Error("Échec de la création de la catégorie en base de données.");
    }
    
    const newCategoryId = result.insertId;
    console.log(`API POST /api/categories: Catégorie ID ${newCategoryId} ajoutée à la BDD.`);

    // Récupérer et retourner la catégorie nouvellement créée pour confirmation au client
    const [newCategoryRows] = await db.execute<CategoryData[]>(
      "SELECT id, nom, slugs, date_creation FROM categories WHERE id = ?", 
      [newCategoryId]
    );

    if (newCategoryRows.length === 0) {
      console.error(`API POST /api/categories: Catégorie ID ${newCategoryId} créée mais introuvable lors de la relecture.`);
      // C'est un état problématique. L'insertion a eu lieu mais on ne peut pas la confirmer.
      // On pourrait retourner un 201 avec un message indiquant de vérifier, ou un 500.
      throw new Error("La catégorie a été créée mais n'a pas pu être récupérée pour confirmation.");
    }
    
    const newCategory = newCategoryRows[0];
    console.log("API POST /api/categories: Nouvelle catégorie récupérée et prête à être retournée:", newCategory);
    // Retourner une réponse JSON valide avec un statut 201 (Created)
    return NextResponse.json({ 
      success: true, 
      message: 'Catégorie ajoutée avec succès.', 
      category: newCategory // Renvoyer l'objet catégorie complet
    }, { status: 201 });

  } catch (error: any) { // Typer 'error' comme 'any' pour accéder à .code ou .message
    console.error('--- ERREUR DÉTAILLÉE DANS API POST /api/categories ---');
    console.error(error);
    console.error('--- FIN ERREUR DÉTAILLÉE ---');
    
    // S'assurer de toujours retourner un JSON d'erreur
    let errorMessage = 'Erreur serveur lors de l\'ajout de la catégorie.';
    if (error.message) { // Si l'erreur a un message (ex: Error SQL ou Error custom)
        errorMessage = error.message;
    }
    // Vous pouvez ajouter des vérifications spécifiques pour les codes d'erreur SQL ici si nécessaire
    // if (error.code === 'ER_DUP_ENTRY') errorMessage = "Entrée dupliquée.";
    
    return NextResponse.json({ error: errorMessage, details: error.toString() }, { status: 500 });
  }
}