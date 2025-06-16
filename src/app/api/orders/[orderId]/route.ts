// src/app/api/orders/[orderId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface OrderDetails extends RowDataPacket {
  // Champs de la table 'orders'
  id: number;
  user_id: number | null;
  total_amount: string; // DECIMAL vient en string
  status: string;
  client_nom: string;
  client_email: string;
  client_notes: string | null;
  created_at: Date; // DATETIME/TIMESTAMP vient en objet Date
  // Pas besoin de payment_intent_id pour l'affichage client ici
}

interface OrderItemDetails extends RowDataPacket {
  // Champs de la table 'order_items'
  id: number;
  service_id: number;
  nom_service: string;
  quantite: number;
  prix_unitaire: string; // DECIMAL vient en string
  sub_total: string;     // DECIMAL vient en string
  // On pourrait joindre pour avoir l'image_url du service si besoin
  // service_image_url?: string | null; 
}

export async function GET(req: NextRequest, { params }: { params: { orderId: string } }) {
  const orderId = parseInt(params.orderId, 10);

  if (isNaN(orderId)) {
    return NextResponse.json({ error: 'ID de commande invalide.' }, { status: 400 });
  }

  console.log(`API GET /api/orders/${orderId}: Récupération des détails de la commande.`);

  try {
    // Récupérer les informations générales de la commande
    const [orderRows] = await db.execute<OrderDetails[]>(
      "SELECT id, user_id, total_amount, status, client_nom, client_email, client_notes, created_at FROM orders WHERE id = ?",
      [orderId]
    );

    if (orderRows.length === 0) {
      console.log(`API GET /api/orders/${orderId}: Commande non trouvée.`);
      return NextResponse.json({ error: 'Commande non trouvée.' }, { status: 404 });
    }
    const orderData = orderRows[0];

    // Récupérer les articles de cette commande
    const [itemsRows] = await db.execute<OrderItemDetails[]>(
      // Optionnel: "JOIN services s ON oi.service_id = s.id SELECT ..., s.image_url as service_image_url" si vous voulez l'image
      "SELECT id, service_id, nom_service, quantite, prix_unitaire, sub_total FROM order_items WHERE order_id = ?",
      [orderId]
    );

    console.log(`API GET /api/orders/${orderId}: Commande trouvée, ${itemsRows.length} articles.`);
    
    // Convertir les prix en nombres pour le frontend
    const orderDetails = {
        ...orderData,
        total_amount: parseFloat(orderData.total_amount),
        created_at: new Date(orderData.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'}),
        items: itemsRows.map(item => ({
            ...item,
            prix_unitaire: parseFloat(item.prix_unitaire),
            sub_total: parseFloat(item.sub_total)
        }))
    };

    return NextResponse.json(orderDetails);

  } catch (error) {
    console.error(`Erreur API GET /api/orders/${orderId}:`, error);
    return NextResponse.json({ error: 'Erreur serveur lors de la récupération des détails de la commande.' }, { status: 500 });
  }
}