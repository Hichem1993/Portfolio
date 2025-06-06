
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

// Interface pour une sous-catégorie
interface SubCategory extends RowDataPacket {
  id: number;
  nom: string;
  slugs: string; // Utilisation de 'slugs' comme dans votre BDD
}

// Interface pour une catégorie principale incluant ses sous-catégories
interface MainCategoryWithSubCategories extends RowDataPacket {
  id: number;
  nom: string;
  slugs: string; // Utilisation de 'slugs' comme dans votre BDD
  sous_categories: SubCategory[];
}

export async function GET(req: NextRequest) {
  try {
    // 1. Récupérer toutes les catégories principales
    const [mainCategoriesRows] = await db.execute<MainCategoryWithSubCategories[]>(
      'SELECT id, nom, slugs FROM categories ORDER BY nom ASC'
    );

    // 2. Pour chaque catégorie principale, récupérer ses sous-catégories
    const categoriesWithSubcategories: MainCategoryWithSubCategories[] = [];

    for (const mainCat of mainCategoriesRows) {
      const [subCategoriesRows] = await db.execute<SubCategory[]>(
        'SELECT id, nom, slugs FROM sous_categorie WHERE id_categorie = ? ORDER BY nom ASC',
        [mainCat.id]
      );
      
      // Ajouter les sous-catégories à la catégorie principale
      categoriesWithSubcategories.push({
        ...mainCat,
        sous_categories: subCategoriesRows,
      });
    }

    // Renvoyer la structure de données complète
    return NextResponse.json(categoriesWithSubcategories);

  } catch (error) {
    console.error('Erreur API GET /api/services/navigation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération de la navigation des services.' },
      { status: 500 }
    );
  }
}