// src/app/api/services/list/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Assurez-vous que ce chemin est correct
import { RowDataPacket } from 'mysql2';

// Interface pour un service tel que retourné par cette API
interface ServiceItem extends RowDataPacket {
  id: number;         // services.id
  nom: string;        // services.nom
  slugs: string;      // services.slugs (slug du service lui-même)
  description: string;// services.description
  prix: string;       // services.prix (DECIMAL de SQL est souvent retourné comme string par node-mysql2)
  image_url: string | null; // services.image_url
  // Infos pour le contexte, récupérées par la jointure
  main_category_nom: string;   // categories.nom
  main_category_slugs: string; // categories.slugs
  sub_category_nom: string;    // sous_categorie.nom
  sub_category_slugs: string;  // sous_categorie.slugs
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mainCategorySlug = searchParams.get('mainCat'); // Slug de la catégorie principale
  const subCategorySlug = searchParams.get('subCat');   // Slug de la sous-catégorie

  console.log(`API /api/services/list: Requête GET reçue. mainCat="${mainCategorySlug}", subCat="${subCategorySlug}"`);

  try {
    // Requête SQL pour récupérer les services avec les informations des catégories jointes
    // Utilise les noms de colonnes exacts de votre base de données (slugs, id_categorie, id_sous_categorie)
    let servicesQuery = `
      SELECT 
        s.id, 
        s.nom, 
        s.slugs, 
        s.description, 
        s.prix, 
        s.image_url,
        c.nom AS main_category_nom,    -- Alias pour la clarté
        c.slugs AS main_category_slugs, -- Alias pour la clarté
        sc.nom AS sub_category_nom,     -- Alias pour la clarté
        sc.slugs AS sub_category_slugs  -- Alias pour la clarté
      FROM services s
      JOIN sous_categorie sc ON s.id_sous_categorie = sc.id
      JOIN categories c ON sc.id_categorie = c.id
      WHERE s.est_disponible = TRUE     -- Ne récupérer que les services disponibles
    `;
    const queryParams: string[] = [];

    if (mainCategorySlug) {
      servicesQuery += ' AND c.slugs = ?'; // Filtrer par le slug de la catégorie principale
      queryParams.push(mainCategorySlug);
    }

    if (subCategorySlug) {
      servicesQuery += ' AND sc.slugs = ?'; // Filtrer par le slug de la sous-catégorie
      queryParams.push(subCategorySlug);
    }

    servicesQuery += ' ORDER BY s.nom ASC'; // Ordonner les services par nom

    const [services] = await db.execute<ServiceItem[]>(servicesQuery, queryParams);
    console.log(`API /api/services/list: ${services.length} services trouvés pour les filtres.`);

    // Logique améliorée pour déterminer le titre de la page
    let pageTitle = "Nos Services"; // Titre par défaut si aucun slug n'est fourni ou valide

    if (mainCategorySlug) {
      const [mainCatInfoRows] = await db.execute<RowDataPacket[]>("SELECT nom FROM categories WHERE slugs = ?", [mainCategorySlug]);
      if (mainCatInfoRows.length > 0) {
        const mainCatName = mainCatInfoRows[0].nom;
        pageTitle = mainCatName; // Par défaut, le nom de la catégorie principale

        if (subCategorySlug) {
          // Vérifier que la sous-catégorie appartient bien à la catégorie principale pour construire le titre
          const [subCatInfoRows] = await db.execute<RowDataPacket[]>(
            "SELECT sc.nom FROM sous_categorie sc JOIN categories c ON sc.id_categorie = c.id WHERE sc.slugs = ? AND c.slugs = ?",
            [subCategorySlug, mainCategorySlug]
          );
          if (subCatInfoRows.length > 0) {
            const subCatName = subCatInfoRows[0].nom;
            pageTitle = `${subCatName} - ${mainCatName}`; // Titre plus spécifique
          } else {
            // La sous-catégorie n'existe pas pour cette catégorie principale,
            // mais la catégorie principale existe. On garde le titre de la catégorie principale.
            // Les services filtrés seront vides si la sous-cat n'existe pas avec ce mainCat.
            console.warn(`API /api/services/list: Sous-catégorie slug "${subCategorySlug}" non trouvée ou n'appartient pas à la catégorie "${mainCategorySlug}". Titre utilisé: "${pageTitle}".`);
          }
        }
      } else {
        // La catégorie principale n'a pas été trouvée.
        // Le titre par défaut "Nos Services" sera utilisé et le tableau services sera probablement vide.
        console.warn(`API /api/services/list: Catégorie principale slug "${mainCategorySlug}" non trouvée. Titre utilisé: "${pageTitle}".`);
      }
    }
    
    console.log(`API /api/services/list: pageTitle final = "${pageTitle}"`);
    return NextResponse.json({ services, pageTitle });

  } catch (error) {
    console.error('Erreur API GET /api/services/list:', error);
    // En cas d'erreur, renvoyer une réponse JSON standardisée
    return NextResponse.json(
      { 
        error: 'Erreur serveur lors de la récupération des services. Veuillez consulter les logs du serveur pour plus de détails.',
        services: [], // Renvoyer un tableau de services vide en cas d'erreur
        pageTitle: "Erreur" // Un titre indiquant une erreur
      },
      { status: 500 }
    );
  }
}