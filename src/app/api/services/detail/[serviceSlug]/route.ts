
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Assurez-vous que ce chemin est correct
import { RowDataPacket } from 'mysql2';

// Interface pour les détails du service. Incluez tous les champs nécessaires.
interface ServiceDetail extends RowDataPacket {
  id: number;
  nom: string;
  slugs: string;
  description: string;
  prix: string; // DECIMAL de SQL est souvent retourné comme string
  image_url: string | null;
  est_disponible: boolean; // Ou TINYINT(1) qui sera 0 ou 1
  main_category_nom: string;   // Nom de la catégorie principale
  main_category_slugs: string; // Slug de la catégorie principale
  sub_category_nom: string;    // Nom de la sous-catégorie
  sub_category_slugs: string;  // Slug de la sous-catégorie
}

export async function GET(
  req: NextRequest,
  { params }: { params: { serviceSlug: string } }
) {
  const { serviceSlug } = params;

  if (!serviceSlug) {
    return NextResponse.json({ error: "Slug du service manquant." }, { status: 400 });
  }

  console.log(`API /api/services/detail: Requête pour le service avec slug "${serviceSlug}"`);

  try {
    // Requête pour récupérer le service spécifique et les informations de ses catégories
    const query = `
      SELECT 
        s.id, 
        s.nom, 
        s.slugs, 
        s.description, 
        s.prix, 
        s.image_url,
        s.est_disponible,
        c.nom AS main_category_nom,
        c.slugs AS main_category_slugs,
        sc.nom AS sub_category_nom,
        sc.slugs AS sub_category_slugs
      FROM services s
      JOIN sous_categorie sc ON s.id_sous_categorie = sc.id
      JOIN categories c ON sc.id_categorie = c.id
      WHERE s.slugs = ? AND s.est_disponible = TRUE 
    `; 

    const [rows] = await db.execute<ServiceDetail[]>(query, [serviceSlug]);

    if (rows.length === 0) {
      console.log(`API /api/services/detail: Service avec slug "${serviceSlug}" non trouvé ou indisponible.`);
      return NextResponse.json({ error: "Service non trouvé ou indisponible." }, { status: 404 });
    }

    console.log(`API /api/services/detail: Service "${rows[0].nom}" trouvé.`);
    return NextResponse.json(rows[0]); // Renvoyer le premier (et unique) service trouvé

  } catch (error) {
    console.error(`Erreur API GET /api/services/detail/${serviceSlug}:`, error);
    return NextResponse.json({ error: "Erreur serveur lors de la récupération des détails du service." }, { status: 500 });
  }
}