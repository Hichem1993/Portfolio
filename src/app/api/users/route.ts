// src/app/api/orders/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

// Adaptez getCurrentUserId à votre système d'authentification serveur
async function getCurrentUserId(req: NextRequest): Promise<number | null> {
  console.warn("API /api/orders/user: getCurrentUserId est un placeholder.");
  const TEST_USER_ID = 1; // IMPORTANT: Utilisez un ID existant pour tester
  console.log(`API /api/orders/user: Utilisation de TEST_USER_ID = ${TEST_USER_ID}`);
  return TEST_USER_ID;
}

// Interfaces pour structurer les données de commande (similaires à celles de la page de confirmation)
interface UserOrderItemFromDB extends RowDataPacket {
  id: number;
  service_id: number;
  nom_service: string;
  quantite: number;
  prix_unitaire: string; 
  sub_total: string;
}
interface UserOrderFromDB extends RowDataPacket {
  id: number;
  user_id: number | null; // Peut être null si vous avez des commandes invitées liées autrement
  total_amount: string;
  status: string;
  client_nom: string;
  client_email: string;
  // client_notes: string | null; // Si vous le sélectionnez
  created_at: Date; 
  items?: UserOrderItemFromDB[]; // Sera ajouté après
}


export async function GET(req: NextRequest) {
  const userId = await getCurrentUserId(req);
  console.log("API GET /api/orders/user - User ID:", userId);

  if (!userId) {
    return NextResponse.json({ error: 'Non authentifié. Impossible de récupérer les commandes.' }, { status: 401 });
  }

  try {
    // Récupérer les commandes de l'utilisateur
    const [ordersRows] = await db.execute<UserOrderFromDB[]>(
      "SELECT id, total_amount, status, client_nom, client_email, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    console.log(`API GET /api/orders/user - ${ordersRows.length} commandes trouvées pour l'utilisateur ${userId}.`);

    const userOrdersWithDetails = []; // Pour stocker les commandes avec leurs items

    for (const orderData of ordersRows) {
      // Pour chaque commande, récupérer ses articles
      const [itemsRows] = await db.execute<UserOrderItemFromDB[]>(
        "SELECT id, service_id, nom_service, quantite, prix_unitaire, sub_total FROM order_items WHERE order_id = ?",
        [orderData.id]
      );
      
      // Formater les données pour le frontend
      userOrdersWithDetails.push({
        ...orderData,
        total_amount: parseFloat(orderData.total_amount as unknown as string),
        created_at: new Date(orderData.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        items: itemsRows.map(item => ({
            ...item,
            prix_unitaire: parseFloat(item.prix_unitaire as unknown as string),
            sub_total: parseFloat(item.sub_total as unknown as string)
        }))
      });
    }
    
    console.log("API GET /api/orders/user - Commandes avec détails prêtes à être envoyées.");
    return NextResponse.json(userOrdersWithDetails);

  } catch (error) {
    console.error('Erreur API GET /api/orders/user:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la récupération des commandes de l\'utilisateur.' }, { status: 500 });
  }
}