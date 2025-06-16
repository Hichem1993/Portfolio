// src/app/api/cart/item/[serviceId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// --- POINT CRUCIAL POUR LE TEST ---
// Remplacez cette fonction par VOTRE vraie logique d'authentification serveur dès que possible.
async function getCurrentUserId(req: NextRequest): Promise<number | null> {
  const TEST_USER_ID = 1; // <<< METTEZ ICI L'ID D'UN UTILISATEUR EXISTANT DANS VOTRE BDD POUR TESTER
  console.log(`API /api/cart/item: getCurrentUserId appelé. Retourne ID ${TEST_USER_ID} pour test.`);
  if (TEST_USER_ID) { return TEST_USER_ID; }
  return null;
}
// --- FIN DU POINT CRUCIAL ---

// Réutiliser ou redéfinir getUserCartItems
async function getUserCartItems(userId: number): Promise<any[]> { 
  console.log(`API Helper (item route): getUserCartItems appelé pour userId: ${userId}`);
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
  const cartItems = rows.map(item => ({
    ...item,
    prix_unitaire: parseFloat(item.prix_unitaire as string),
    quantite: Number(item.quantite)
  }));
  console.log(`API Helper (item route): getUserCartItems pour userId ${userId} a trouvé ${cartItems.length} items.`);
  return cartItems;
}

export async function PUT(req: NextRequest, { params }: { params: { serviceId: string } }) {
  const userId = await getCurrentUserId(req);
  if (!userId) return NextResponse.json({ error: 'Non authentifié (API PUT item)' }, { status: 401 });

  const serviceId = parseInt(params.serviceId, 10);
  console.log(`API PUT /api/cart/item/${serviceId}: Requête reçue pour user ${userId}.`);
  if (isNaN(serviceId)) return NextResponse.json({ error: 'ID de service invalide' }, { status: 400 });

  try {
    const body = await req.json();
    const { quantite } = body;
    console.log(`API PUT /api/cart/item/${serviceId}: Body reçu:`, body);
    if (typeof quantite !== 'number' || quantite <= 0) {
      return NextResponse.json({ error: 'Quantité invalide' }, { status: 400 });
    }
    const [result] = await db.execute<ResultSetHeader>(
      'UPDATE cart_items SET quantite = ? WHERE user_id = ? AND service_id = ?',
      [quantite, userId, serviceId]
    );
    if (result.affectedRows === 0) {
      console.log(`API PUT /api/cart/item/${serviceId}: Article non trouvé ou quantité inchangée.`);
      return NextResponse.json({ error: 'Article non trouvé ou quantité inchangée' }, { status: 404 });
    }
    console.log(`API PUT /api/cart/item/${serviceId}: Article mis à jour.`);
    const updatedCart = await getUserCartItems(userId);
    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error(`API PUT /api/cart/item/${serviceId} Erreur:`, error);
    return NextResponse.json({ error: 'Erreur serveur màj quantité' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { serviceId: string } }) {
  const userId = await getCurrentUserId(req);
  if (!userId) return NextResponse.json({ error: 'Non authentifié (API DELETE item)' }, { status: 401 });

  const serviceId = parseInt(params.serviceId, 10);
  console.log(`API DELETE /api/cart/item/${serviceId}: Requête reçue pour user ${userId}.`);
  if (isNaN(serviceId)) return NextResponse.json({ error: 'ID de service invalide' }, { status: 400 });

  try {
    const [result] = await db.execute<ResultSetHeader>(
      'DELETE FROM cart_items WHERE user_id = ? AND service_id = ?',
      [userId, serviceId]
    );
    if (result.affectedRows === 0) {
      console.log(`API DELETE /api/cart/item/${serviceId}: Article non trouvé.`);
      return NextResponse.json({ error: 'Article non trouvé' }, { status: 404 });
    }
    console.log(`API DELETE /api/cart/item/${serviceId}: Article supprimé.`);
    const updatedCart = await getUserCartItems(userId);
    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error(`API DELETE /api/cart/item/${serviceId} Erreur:`, error);
    return NextResponse.json({ error: 'Erreur serveur suppression article' }, { status: 500 });
  }
}