// Importation des modules nécessaires depuis Next.js
import { NextRequest, NextResponse } from 'next/server';
// Importation de l'instance de base de données
import { db } from '@/lib/db';
// Type pour les résultats d'insertion SQL
import { ResultSetHeader } from 'mysql2';
// Type utilisé pour représenter un article dans le panier
import { CartItem } from '@/contexts/CartContext'; // Vérifiez bien que ce chemin est correct

// Fonction factice pour obtenir l'ID de l'utilisateur connecté (à adapter à votre auth)
async function getCurrentUserId(req: NextRequest): Promise<number | null> {
  console.warn("API /api/orders (POST): getCurrentUserId est un placeholder.");
  // Pour le test vous pouvez retourner un ID fixe
  // return 1;
  return null;
}

// Structure du corps attendu dans la requête POST
interface OrderRequestBody {
  cartItems: CartItem[];         // Articles du panier
  totalAmount: number;           // Total de la commande
  clientInfo: {                  // Informations sur le client
    nom: string;
    email: string;
    notes?: string;
  };
  userId: number | null;         // Optionnel : ID utilisateur fourni côté client
}

// === Création d'une commande ===
export async function POST(req: NextRequest) {
  console.log("API POST /api/orders: Requête reçue pour créer une commande.");

  // Récupère l'ID de l'utilisateur connecté depuis la session serveur (placeholder ici)
  const connectedUserId = await getCurrentUserId(req);

  try {
    // Récupération et validation du corps de la requête
    const body: OrderRequestBody = await req.json();
    const { cartItems, totalAmount, clientInfo, userId: clientProvidedUserId } = body;

    // Choix de l'ID utilisateur final : priorité à celui fourni par le client
    const finalUserIdForOrder = clientProvidedUserId || connectedUserId;

    // Vérifie que toutes les données essentielles sont présentes
    if (!cartItems || cartItems.length === 0 || typeof totalAmount !== 'number' || !clientInfo || !clientInfo.email || !clientInfo.nom) {
      return NextResponse.json({ error: 'Données de commande incomplètes.' }, { status: 400 });
    }

    // Démarrage de la transaction SQL
    const connection = await db.getConnection();
    await connection.beginTransaction();
    let orderId: number | null = null;

    try {
      // Création de l'enregistrement principal de la commande
      const orderQuery = `
        INSERT INTO orders (user_id, total_amount, status, client_nom, client_email, client_notes) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const [orderResult] = await connection.execute<ResultSetHeader>(orderQuery, [
        finalUserIdForOrder,             // Peut être null si commande invitée
        totalAmount,                     // Montant total
        'paid',                          // Statut de la commande
        clientInfo.nom,
        clientInfo.email,
        clientInfo.notes || null,
      ]);

      // Récupère l'ID de la commande nouvellement créée
      orderId = orderResult.insertId;

      // Insertion des lignes dans order_items (détails de la commande)
      for (const item of cartItems) {
        const itemPrixUnitaire = Number(item.prix_unitaire);
        if (isNaN(itemPrixUnitaire)) throw new Error(`Prix unitaire invalide pour le service ID ${item.service_id}`);

        const orderItemQuery = `
          INSERT INTO order_items (order_id, service_id, nom_service, quantite, prix_unitaire, sub_total)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        await connection.execute(orderItemQuery, [
          orderId,
          item.service_id,
          item.nom,
          item.quantite,
          itemPrixUnitaire,
          itemPrixUnitaire * item.quantite, // Sous-total pour cet article
        ]);
      }

      // Si l'utilisateur est connecté, on vide son panier
      if (finalUserIdForOrder) {
        await connection.execute('DELETE FROM cart_items WHERE user_id = ?', [finalUserIdForOrder]);
      }

      // Commit de la transaction si tout est OK
      await connection.commit();
      return NextResponse.json({
        success: true,
        message: 'Commande créée avec succès.',
        orderId: orderId
      });

    } catch (dbError) {
      // Si une erreur SQL survient, on annule tout
      await connection.rollback();
      console.error('API POST /api/orders: Erreur DB transaction:', dbError);
      throw dbError;
    } finally {
      // Libère la connexion à la base
      connection.release();
    }

  } catch (error) {
    // Gestion des erreurs globales
    console.error('API POST /api/orders: Erreur générale:', error);
    return NextResponse.json({ error: 'Erreur serveur création commande.' }, { status: 500 });
  }
}
