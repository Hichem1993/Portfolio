// src/app/api/orders/admin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

// Interface pour une commande telle que vue par l'admin (inclut infos utilisateur si jointes)
export interface AdminOrderData extends RowDataPacket {
  order_id: number;
  user_id: number | null;
  total_amount: string; 
  status: string;
  client_nom_commande: string; 
  client_email_commande: string; 
  user_nom: string | null; 
  user_prenom: string | null; 
  user_email: string | null; 
  order_created_at: Date | string; 
  items?: AdminOrderItemData[]; 
}

// Interface pour un item de commande
export interface AdminOrderItemData extends RowDataPacket {
  id: number;
  service_id: number;
  nom_service: string;
  quantite: number;
  prix_unitaire: string; 
  sub_total: string;     
}

// Fonction pour gérer les requêtes GET vers /api/orders/admin
export async function GET(req: NextRequest) {
  console.log("API GET /api/orders/admin: Requête pour lister toutes les commandes.");
  try {

    // Récupérer toutes les commandes, en joignant avec la table 'user' pour les infos client si disponibles
    const [ordersFromDB] = await db.execute<AdminOrderData[]>(
      `SELECT 
        o.id as order_id, 
        o.user_id, 
        o.total_amount, 
        o.status, 
        o.client_nom as client_nom_commande, 
        o.client_email as client_email_commande,
        o.created_at as order_created_at,
        u.nom as user_nom,
        u.prenom as user_prenom,
        u.email as user_email
       FROM orders o
       LEFT JOIN user u ON o.user_id = u.id
       ORDER BY o.created_at DESC` // Les plus récentes en premier
    );

    const ordersWithDetails = []; // Pour stocker les commandes complètes

    // Pour chaque commande, récupérer ses articles
    for (const order of ordersFromDB) {
        const [items] = await db.execute<AdminOrderItemData[]>(
            `SELECT id, service_id, nom_service, quantite, prix_unitaire, sub_total 
             FROM order_items 
             WHERE order_id = ?`,
            [order.order_id] // Utiliser l'ID de la commande actuelle
        );
        
        // Formater les données pour le client
        ordersWithDetails.push({
            ...order,
            total_amount: parseFloat(order.total_amount).toFixed(2), // Assurer 2 décimales
            order_created_at: new Date(order.order_created_at).toLocaleDateString('fr-FR', {
                year: 'numeric', month: '2-digit', day: '2-digit', 
                hour: '2-digit', minute: '2-digit'
            }),
            items: items.map(item => ({
                ...item,
                prix_unitaire: parseFloat(item.prix_unitaire).toFixed(2),
                sub_total: parseFloat(item.sub_total).toFixed(2),
            }))
        });
    }

    console.log(`API GET /api/orders/admin: ${ordersWithDetails.length} commandes trouvées et formatées.`);
    return NextResponse.json(ordersWithDetails);

  } catch (error) {
    console.error('Erreur API GET /api/orders/admin:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des commandes pour l\'administration.' },
      { status: 500 }
    );
  }
}