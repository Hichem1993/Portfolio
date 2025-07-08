// Importation des objets nécessaires depuis Next.js
import { NextRequest, NextResponse } from 'next/server';
// Importation de la base de données MySQL
import { db } from '@/lib/db';
// Importation des types pour la réponse SQL
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Fonction simulant l'identification d'un utilisateur (pour test uniquement)
async function getCurrentUserId(req: NextRequest): Promise<number | null> {
  const TEST_USER_ID = 1; // <<< Remplacer par un ID utilisateur réel pour la production
  console.log(`API /api/cart/item: getCurrentUserId appelé. Retourne ID ${TEST_USER_ID} pour test.`);
  if (TEST_USER_ID) { return TEST_USER_ID; }
  return null;
}

// Récupère les articles du panier pour un utilisateur donné
async function getUserCartItems(userId: number): Promise<any[]> {
  console.log(`API Helper (item route): getUserCartItems appelé pour userId: ${userId}`);
  
  // Exécution d'une requête SQL pour obtenir tous les articles du panier liés à l'utilisateur
  const [rows] = await db.execute<RowDataPacket[]>(
    `SELECT 
       ci.service_id, s.nom, ci.quantite, ci.prix_unitaire, 
       s.image_url, s.slugs, c.slugs AS main_category_slugs, sc.slugs AS sub_category_slugs
     FROM cart_items ci
     JOIN services s ON ci.service_id = s.id
     JOIN sous_categorie sc ON s.id_sous_categorie = sc.id
     JOIN categories c ON sc.id_categorie = c.id
     WHERE ci.user_id = ? ORDER BY ci.id ASC`,
    [userId]
  );

  // Transformation des données pour s'assurer que les types sont corrects
  const cartItems = rows.map(item => ({
    ...item,
    prix_unitaire: parseFloat(item.prix_unitaire as string), // Conversion en nombre
    quantite: Number(item.quantite) // Conversion en entier
  }));
  
  console.log(`API Helper (item route): getUserCartItems pour userId ${userId} a trouvé ${cartItems.length} items.`);
  return cartItems;
}

// === MISE À JOUR DE LA QUANTITÉ D'UN ARTICLE DANS LE PANIER ===
export async function PUT(req: NextRequest, { params }: { params: { serviceId: string } }) {
  const userId = await getCurrentUserId(req);
  if (!userId) return NextResponse.json({ error: 'Non authentifié (API PUT item)' }, { status: 401 });

  const serviceId = parseInt(params.serviceId, 10); // Extraction de l'ID du service depuis l'URL
  console.log(`API PUT /api/cart/item/${serviceId}: Requête reçue pour user ${userId}.`);
  if (isNaN(serviceId)) return NextResponse.json({ error: 'ID de service invalide' }, { status: 400 });

  try {
    const body = await req.json(); // Lecture du corps de la requête (JSON)
    const { quantite } = body;
    console.log(`API PUT /api/cart/item/${serviceId}: Body reçu:`, body);

    // Vérifie que la quantité est un nombre valide
    if (typeof quantite !== 'number' || quantite <= 0) {
      return NextResponse.json({ error: 'Quantité invalide' }, { status: 400 });
    }

    // Mise à jour de la quantité dans la BDD
    const [result] = await db.execute<ResultSetHeader>(
      'UPDATE cart_items SET quantite = ? WHERE user_id = ? AND service_id = ?',
      [quantite, userId, serviceId]
    );

    // Vérifie que la mise à jour a affecté au moins une ligne
    if (result.affectedRows === 0) {
      console.log(`API PUT /api/cart/item/${serviceId}: Article non trouvé ou quantité inchangée.`);
      return NextResponse.json({ error: 'Article non trouvé ou quantité inchangée' }, { status: 404 });
    }

    console.log(`API PUT /api/cart/item/${serviceId}: Article mis à jour.`);
    const updatedCart = await getUserCartItems(userId); // Retourne le panier mis à jour
    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error(`API PUT /api/cart/item/${serviceId} Erreur:`, error);
    return NextResponse.json({ error: 'Erreur serveur màj quantité' }, { status: 500 });
  }
}

// === SUPPRESSION D'UN ARTICLE PRÉCIS DU PANIER ===
export async function DELETE(req: NextRequest, { params }: { params: { serviceId: string } }) {
  const userId = await getCurrentUserId(req);
  if (!userId) return NextResponse.json({ error: 'Non authentifié (API DELETE item)' }, { status: 401 });

  const serviceId = parseInt(params.serviceId, 10); // ID de l'article à supprimer
  console.log(`API DELETE /api/cart/item/${serviceId}: Requête reçue pour user ${userId}.`);
  if (isNaN(serviceId)) return NextResponse.json({ error: 'ID de service invalide' }, { status: 400 });

  try {
    // Suppression de l'article du panier
    const [result] = await db.execute<ResultSetHeader>(
      'DELETE FROM cart_items WHERE user_id = ? AND service_id = ?',
      [userId, serviceId]
    );

    // Vérifie que l'article existait bien
    if (result.affectedRows === 0) {
      console.log(`API DELETE /api/cart/item/${serviceId}: Article non trouvé.`);
      return NextResponse.json({ error: 'Article non trouvé' }, { status: 404 });
    }

    console.log(`API DELETE /api/cart/item/${serviceId}: Article supprimé.`);
    const updatedCart = await getUserCartItems(userId); // Retourne le panier après suppression
    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error(`API DELETE /api/cart/item/${serviceId} Erreur:`, error);
    return NextResponse.json({ error: 'Erreur serveur suppression article' }, { status: 500 });
  }
}
