// src/app/api/orders/route.ts // <<<< CE FICHIER DOIT ÊTRE ICI
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ResultSetHeader } from 'mysql2'; // RowDataPacket n'est pas nécessaire ici si on n'utilise pas de SELECT complexe
import { CartItem } from '@/contexts/CartContext'; // Assurez-vous que ce chemin est correct

// PLACEHOLDER: Adaptez cette fonction à votre système d'authentification serveur
async function getCurrentUserId(req: NextRequest): Promise<number | null> {
  console.warn("API /api/orders (POST): getCurrentUserId est un placeholder.");
  // Pour tester, vous pouvez retourner un ID utilisateur existant
  // return 1; 
  return null; 
}

interface OrderRequestBody {
  cartItems: CartItem[];
  totalAmount: number;
  clientInfo: {
    nom: string;
    email: string;
    notes?: string;
  };
  userId: number | null; 
}

export async function POST(req: NextRequest) {
  console.log("API POST /api/orders: Requête reçue pour créer une commande.");
  const connectedUserId = await getCurrentUserId(req); 
  
  try {
    const body: OrderRequestBody = await req.json();
    const { cartItems, totalAmount, clientInfo, userId: clientProvidedUserId } = body;
    const finalUserIdForOrder = clientProvidedUserId || connectedUserId; 

    if (!cartItems || cartItems.length === 0 || typeof totalAmount !== 'number' || !clientInfo || !clientInfo.email || !clientInfo.nom) {
      return NextResponse.json({ error: 'Données de commande incomplètes.' }, { status: 400 });
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();
    let orderId: number | null = null;

    try {
      const orderQuery = `
        INSERT INTO orders (user_id, total_amount, status, client_nom, client_email, client_notes) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const [orderResult] = await connection.execute<ResultSetHeader>(orderQuery, [
        finalUserIdForOrder, totalAmount, 'paid', 
        clientInfo.nom, clientInfo.email, clientInfo.notes || null,
      ]);
      orderId = orderResult.insertId;

      for (const item of cartItems) {
        const itemPrixUnitaire = Number(item.prix_unitaire);
        if (isNaN(itemPrixUnitaire)) throw new Error(`Prix unitaire invalide pour le service ID ${item.service_id}`);
        
        const orderItemQuery = `
          INSERT INTO order_items (order_id, service_id, nom_service, quantite, prix_unitaire, sub_total)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        await connection.execute(orderItemQuery, [
          orderId, item.service_id, item.nom, item.quantite,
          itemPrixUnitaire, itemPrixUnitaire * item.quantite,
        ]);
      }

      if (finalUserIdForOrder) {
        await connection.execute('DELETE FROM cart_items WHERE user_id = ?', [finalUserIdForOrder]);
      }

      await connection.commit();
      return NextResponse.json({ success: true, message: 'Commande créée avec succès.', orderId: orderId });

    } catch (dbError) {
      await connection.rollback();
      console.error('API POST /api/orders: Erreur DB transaction:', dbError);
      throw dbError; 
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('API POST /api/orders: Erreur générale:', error);
    return NextResponse.json({ error: 'Erreur serveur création commande.' }, { status: 500 });
  }
}

// Vous pourriez ajouter une fonction GET ici pour lister TOUTES les commandes (pour un admin par exemple)
// export async function GET(req: NextRequest) { ... }