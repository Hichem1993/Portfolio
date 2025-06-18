// src/app/api/services-crud/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Assurez-vous que ce chemin est correct
import { RowDataPacket, ResultSetHeader } from 'mysql2';
// Importer l'interface ServiceDataAdmin depuis le fichier route.ts parent (celui dans /api/services-crud/)
// S'il n'est pas exporté de là, vous pouvez redéfinir une interface similaire ici.
import { ServiceDataAdmin } from '../route'; // Ajustez ce chemin si ServiceDataAdmin est ailleurs ou redéfinissez-la

// Fonction PUT pour modifier un service existant
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const serviceId = parseInt(params.id, 10); // Convertir l'ID de la route en nombre

  // Vérifier si l'ID est un nombre valide
  if (isNaN(serviceId) || serviceId <= 0) {
    return NextResponse.json({ error: 'ID de service invalide fourni.' }, { status: 400 });
  }
  console.log(`API PUT /api/services-crud/${serviceId}: Requête de mise à jour reçue.`);

  try {
    // TODO: Implémenter une vérification de rôle (admin uniquement) ici pour la sécurité

    const body = await req.json(); // Parser le corps de la requête JSON
    console.log(`API PUT /api/services-crud/${serviceId}: Body reçu:`, JSON.stringify(body, null, 2));

    // Déstructurer et valider les champs attendus du corps de la requête
    const { 
        nom, 
        slugs, 
        description, 
        prix, 
        image_url, 
        est_disponible, 
        id_sous_categorie 
    } = body;

    // Validation robuste des champs
    if (!nom || typeof nom !== 'string' || nom.trim() === '' ||
        !slugs || typeof slugs !== 'string' || slugs.trim() === '' ||
        !description || typeof description !== 'string' || description.trim() === '' ||
        typeof prix === 'undefined' || prix === null || isNaN(parseFloat(String(prix))) || parseFloat(String(prix)) < 0 ||
        typeof id_sous_categorie === 'undefined' || id_sous_categorie === null || isNaN(parseInt(String(id_sous_categorie), 10)) ||
        typeof est_disponible === 'undefined' // est_disponible doit être explicitement true ou false
    ) {
      console.error("API PUT /api/services-crud: Données manquantes ou invalides pour la mise à jour.", body);
      return NextResponse.json({ error: 'Tous les champs requis (nom, slugs, description, prix, id_sous_categorie, est_disponible) doivent être valides.' }, { status: 400 });
    }

    // Préparer les valeurs pour la base de données
    const nomTrimmed = nom.trim();
    const slugsTrimmed = slugs.trim();
    const descriptionTrimmed = description.trim();
    const prixNumerique = parseFloat(String(prix));
    const idSousCategorieNumerique = parseInt(String(id_sous_categorie), 10);
    const estDisponibleDB = Boolean(est_disponible) ? 1 : 0; // Convertir en 0 ou 1 pour TINYINT

    // Vérifier si le nouveau slug entre en conflit avec un autre service (excluant l'ID actuel)
    const [existingBySlug] = await db.execute<RowDataPacket[]>(
      'SELECT id FROM services WHERE slugs = ? AND id != ?', 
      [slugsTrimmed, serviceId]
    );
    if (existingBySlug.length > 0) {
      return NextResponse.json({ error: 'Un autre service utilise déjà ce slug.' }, { status: 409 }); // 409 Conflict
    }

    // Vérifier si la sous-catégorie fournie existe
    const [subCatCheck] = await db.execute<RowDataPacket[]>('SELECT id FROM sous_categorie WHERE id = ?', [idSousCategorieNumerique]);
    if (subCatCheck.length === 0) {
        return NextResponse.json({ error: 'L\'ID de la sous-catégorie fourni n\'existe pas.' }, { status: 400 });
    }

    console.log(`API PUT /api/services-crud/${serviceId}: Préparation de la requête UPDATE avec les données:`, { nomTrimmed, slugsTrimmed, descriptionTrimmed, prixNumerique, image_url, estDisponibleDB, idSousCategorieNumerique });

    // Exécuter la requête UPDATE
    const [result] = await db.execute<ResultSetHeader>(
      'UPDATE services SET nom = ?, slugs = ?, description = ?, prix = ?, image_url = ?, est_disponible = ?, id_sous_categorie = ? WHERE id = ?',
      [nomTrimmed, slugsTrimmed, descriptionTrimmed, prixNumerique, image_url || null, estDisponibleDB, idSousCategorieNumerique, serviceId]
    );
    console.log(`API PUT /api/services-crud/${serviceId}: Résultat de l'opération UPDATE DB:`, result);

    if (result.affectedRows === 0) {
      // Cela peut se produire si l'ID du service n'existe pas.
      console.warn(`API PUT /api/services-crud/${serviceId}: Aucune ligne affectée. Le service avec cet ID n'existe peut-être pas.`);
      return NextResponse.json({ error: 'Service non trouvé ou aucune modification n\'a été nécessaire (données identiques).' }, { status: 404 });
    }

    // Récupérer le service mis à jour avec toutes les informations jointes pour le renvoyer au client
    const [updatedServiceRows] = await db.execute<ServiceDataAdmin[]>(
        `SELECT s.id, s.nom, s.slugs, s.description, s.prix, s.image_url, s.est_disponible,
                s.id_sous_categorie, sc.nom as nom_sous_categorie, c.nom as nom_categorie, s.date_creation 
         FROM services s
         JOIN sous_categorie sc ON s.id_sous_categorie = sc.id
         JOIN categories c ON sc.id_categorie = c.id
         WHERE s.id = ?`, 
        [serviceId]
    );

    if (updatedServiceRows.length === 0) {
        console.error(`API PUT /api/services-crud/${serviceId}: ERREUR CRITIQUE - Service mis à jour (affectedRows > 0) mais introuvable lors de la relecture.`);
        return NextResponse.json({ error: "Erreur lors de la récupération du service mis à jour après modification." }, { status: 500 });
    }
    
    // S'assurer que est_disponible est un booléen dans la réponse
    const serviceRetourne = {...updatedServiceRows[0], est_disponible: Boolean(updatedServiceRows[0].est_disponible)};
    console.log(`API PUT /api/services-crud/${serviceId}: Service mis à jour avec succès. Données retournées:`, serviceRetourne);
    return NextResponse.json({ success: true, message: 'Service mis à jour avec succès.', service: serviceRetourne });

  } catch (error: any) {
    console.error(`--- ERREUR DÉTAILLÉE DANS API PUT /api/services-crud/${serviceId} ---`);
    console.error(error);
    console.error('--- FIN ERREUR DÉTAILLÉE ---');
    let errorMessage = 'Erreur serveur lors de la mise à jour du service.';
    if (error.code === 'ER_NO_REFERENCED_ROW_2') { // Erreur de clé étrangère pour id_sous_categorie
        errorMessage = "L'ID de la sous-catégorie fourni pour la mise à jour n'est pas valide ou n'existe pas.";
        return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
    if (error.message) { errorMessage = error.message; }
    return NextResponse.json({ error: errorMessage, details: error.toString() }, { status: 500 });
  }
}

// Fonction DELETE pour supprimer un service existant
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const serviceId = parseInt(params.id, 10);
  if (isNaN(serviceId) || serviceId <= 0) {
    return NextResponse.json({ error: 'ID de service invalide.' }, { status: 400 });
  }
  console.log(`API DELETE /api/services-crud/${serviceId}: Requête de suppression reçue.`);

  try {
    // TODO: Sécuriser cette route (admin uniquement)

    // Vérifier si ce service est utilisé dans des lignes de commande (order_items)
    const [linkedOrderItems] = await db.execute<RowDataPacket[]>('SELECT id FROM order_items WHERE service_id = ?', [serviceId]);
    if(linkedOrderItems.length > 0) {
        console.warn(`API DELETE /api/services-crud/${serviceId}: Tentative de suppression d'un service lié à ${linkedOrderItems.length} commande(s).`);
        return NextResponse.json({ error: `Impossible de supprimer: ce service est inclus dans ${linkedOrderItems.length} commande(s) existante(s).` }, { status: 409 }); // 409 Conflict
    }

    // Vérifier si le service existe avant de tenter de le supprimer
    const [serviceCheck] = await db.execute<RowDataPacket[]>('SELECT id FROM services WHERE id = ?', [serviceId]);
    if (serviceCheck.length === 0) {
        console.log(`API DELETE /api/services-crud/${serviceId}: Service non trouvé.`);
        return NextResponse.json({ error: 'Service non trouvé.' }, { status: 404 });
    }

    const [result] = await db.execute<ResultSetHeader>('DELETE FROM services WHERE id = ?', [serviceId]);
    console.log(`API DELETE /api/services-crud/${serviceId}: Résultat de l'opération DELETE DB:`, result);


    if (result.affectedRows === 0) {
      // Ne devrait pas arriver si la vérification précédente a trouvé le service, mais par sécurité.
      console.warn(`API DELETE /api/services-crud/${serviceId}: Aucune ligne affectée, le service n'a peut-être pas été trouvé.`);
      return NextResponse.json({ error: 'Service non trouvé lors de la tentative de suppression.' }, { status: 404 });
    }

    console.log(`API DELETE /api/services-crud/${serviceId}: Service supprimé avec succès.`);
    return NextResponse.json({ success: true, message: 'Service supprimé avec succès.' });

  } catch (error: any) {
    console.error(`--- ERREUR DÉTAILLÉE DANS API DELETE /api/services-crud/${serviceId} ---`);
    console.error(error);
    console.error('--- FIN ERREUR DÉTAILLÉE ---');
    // Gérer les erreurs de clé étrangère si la suppression est bloquée par la DB pour d'autres raisons (panier, etc.)
    // if (error.code === 'ER_ROW_IS_REFERENCED_2') {
    //     return NextResponse.json({ error: 'Impossible de supprimer ce service car il est référencé ailleurs (ex: paniers actifs).' }, { status: 409 });
    // }
    return NextResponse.json({ error: 'Erreur serveur lors de la suppression du service.', details: error.toString() }, { status: 500 });
  }
}