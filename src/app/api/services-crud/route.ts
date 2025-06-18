// src/app/api/services-crud/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Assurez-vous que ce chemin est correct
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import bcrypt from 'bcryptjs'; // Importé au cas où, mais pas utilisé dans ce CRUD de service

// Interface pour les données d'un service telles que retournées par GET ou après POST/PUT
export interface ServiceDataAdmin extends RowDataPacket {
  id: number;
  nom: string;
  slugs: string;
  description: string;
  prix: string; // Vient de DECIMAL, sera string
  image_url: string | null;
  est_disponible: boolean | number; // TINYINT(1) peut venir comme nombre
  id_sous_categorie: number;
  nom_sous_categorie?: string;    // Nom de la sous-catégorie (via jointure dans GET)
  nom_categorie?: string;         // Nom de la catégorie principale (via jointure dans GET)
  date_creation: Date | string;  // La DB retourne Date, JSON.stringify la convertit en string ISO
}

// Fonction GET pour lister tous les services pour l'administration
export async function GET(req: NextRequest) {
  console.log("API GET /api/services-crud: Requête reçue pour lister tous les services.");
  try {
    // TODO: Implémenter une VRAIE vérification pour s'assurer que seul un admin peut appeler cette route.
    // Pour l'instant, elle est ouverte.

    const [servicesFromDB] = await db.execute<ServiceDataAdmin[]>(
      `SELECT 
         s.id, s.nom, s.slugs, s.description, s.prix, s.image_url, s.est_disponible,
         s.id_sous_categorie, sc.nom as nom_sous_categorie,
         c.nom as nom_categorie, s.date_creation 
       FROM services s
       JOIN sous_categorie sc ON s.id_sous_categorie = sc.id
       JOIN categories c ON sc.id_categorie = c.id
       ORDER BY c.nom ASC, sc.nom ASC, s.nom ASC`
    );
    
    // Convertir est_disponible en booléen pour la réponse JSON si ce n'est pas déjà le cas
    // (MySQL TINYINT(1) peut être retourné comme 0 ou 1)
    const services = servicesFromDB.map(service => ({
        ...service,
        est_disponible: Boolean(service.est_disponible) 
    }));

    console.log(`API GET /api/services-crud: ${services.length} services trouvés et retournés.`);
    return NextResponse.json(services);

  } catch (error) {
    console.error('--- ERREUR DÉTAILLÉE DANS API GET /api/services-crud ---');
    console.error(error);
    console.error('--- FIN ERREUR DÉTAILLÉE ---');
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des services. Consultez les logs du serveur.' },
      { status: 500 }
    );
  }
}

// Fonction POST pour créer un nouveau service
export async function POST(req: NextRequest) {
  console.log("API POST /api/services-crud: Requête reçue pour créer un service.");
  try {
    // TODO: Sécuriser cette route (admin uniquement)
    const body = await req.json();
    console.log("API POST /api/services-crud: Body reçu:", JSON.stringify(body, null, 2)); 
    
    const { 
        nom, slugs, description, prix, image_url, 
        est_disponible = true, // Valeur par défaut si non fourni par le client
        id_sous_categorie 
    } = body;

    // Validation robuste des champs requis
    if (!nom || typeof nom !== 'string' || nom.trim() === '') {
      return NextResponse.json({ error: 'Le nom du service est requis.' }, { status: 400 });
    }
    if (!slugs || typeof slugs !== 'string' || slugs.trim() === '') {
      return NextResponse.json({ error: 'Le slug du service est requis.' }, { status: 400 });
    }
    if (!description || typeof description !== 'string' || description.trim() === '') {
      return NextResponse.json({ error: 'La description du service est requise.' }, { status: 400 });
    }
    // Prix peut être 0, donc vérifier si undefined ou non nombre
    if (typeof prix === 'undefined' || prix === null || isNaN(parseFloat(String(prix))) || parseFloat(String(prix)) < 0) {
      return NextResponse.json({ error: 'Le prix doit être un nombre positif valide (peut être 0).' }, { status: 400 });
    }
    if (typeof id_sous_categorie === 'undefined' || id_sous_categorie === null || isNaN(parseInt(String(id_sous_categorie), 10))) {
      return NextResponse.json({ error: 'L\'ID de la sous-catégorie est requis et doit être un nombre.' }, { status: 400 });
    }

    // Conversion des types pour la base de données
    const prixNumerique = parseFloat(String(prix));
    const idSousCategorieNumerique = parseInt(String(id_sous_categorie), 10);
    // S'assurer que est_disponible est bien 0 ou 1 pour TINYINT(1)
    const estDisponibleDB = Boolean(est_disponible) ? 1 : 0; 

    // Vérifier doublon de slug pour les services
    const [existingBySlug] = await db.execute<RowDataPacket[]>('SELECT id FROM services WHERE slugs = ?', [slugs.trim()]);
    if (existingBySlug.length > 0) {
      return NextResponse.json({ error: 'Un service avec ce slug existe déjà.' }, { status: 409 });
    }

    // Vérifier si la sous-catégorie existe
    const [subCatCheck] = await db.execute<RowDataPacket[]>('SELECT id FROM sous_categorie WHERE id = ?', [idSousCategorieNumerique]);
    if (subCatCheck.length === 0) {
        return NextResponse.json({ error: 'L\'ID de la sous-catégorie fourni n\'existe pas.' }, { status: 400 });
    }

    console.log("API POST /api/services-crud: Données prêtes pour INSERT:", { nom: nom.trim(), slugs: slugs.trim(), description: description.trim(), prixNumerique, image_url, estDisponibleDB, idSousCategorieNumerique });

    const [result] = await db.execute<ResultSetHeader>(
      'INSERT INTO services (nom, slugs, description, prix, image_url, est_disponible, id_sous_categorie, date_creation) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [nom.trim(), slugs.trim(), description.trim(), prixNumerique, image_url || null, estDisponibleDB, idSousCategorieNumerique]
    );
    console.log("API POST /api/services-crud: Résultat INSERT DB:", result);

    const newServiceId = result.insertId;
    if (!newServiceId) {
        console.error("API POST /api/services-crud: Échec de l'obtention de l'insertId après INSERT.");
        throw new Error("Échec de la création du service, aucun ID retourné après insertion.");
    }

    // Récupérer le nouveau service avec les infos jointes pour le retourner
    const [newServiceRows] = await db.execute<ServiceDataAdmin[]>(
        `SELECT s.id, s.nom, s.slugs, s.description, s.prix, s.image_url, s.est_disponible,
                s.id_sous_categorie, sc.nom as nom_sous_categorie, c.nom as nom_categorie, s.date_creation 
         FROM services s
         JOIN sous_categorie sc ON s.id_sous_categorie = sc.id
         JOIN categories c ON sc.id_categorie = c.id
         WHERE s.id = ?`, 
        [newServiceId]
    );
    if (newServiceRows.length === 0) {
        console.error(`API POST /api/services-crud: Service ID ${newServiceId} créé mais introuvable lors de la relecture.`);
        throw new Error("Service créé mais non récupérable pour confirmation.");
    }
    
    const serviceRetourne = {...newServiceRows[0], est_disponible: Boolean(newServiceRows[0].est_disponible)};
    console.log("API POST /api/services-crud: Service ajouté avec succès, retour:", serviceRetourne);
    return NextResponse.json({ success: true, message: 'Service ajouté avec succès.', service: serviceRetourne }, { status: 201 });

  } catch (error: any) {
    console.error('--- ERREUR DÉTAILLÉE DANS API POST /api/services-crud ---');
    console.error(error); // Log l'erreur complète pour le débogage
    console.error('--- FIN ERREUR DÉTAILLÉE ---');
    
    let errorMessage = 'Erreur serveur lors de l\'ajout du service.';
    // Vous pouvez ajouter des vérifications spécifiques pour les codes d'erreur SQL ici
    if (error.code === 'ER_NO_REFERENCED_ROW_2') { // Erreur de clé étrangère
        errorMessage = "L'ID de la sous-catégorie fourni n'est pas valide ou n'existe pas.";
        return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
    if (error.message) {
        errorMessage = error.message;
    }
    
    return NextResponse.json({ error: errorMessage, details: error.toString() }, { status: 500 });
  }
}