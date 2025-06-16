// src/app/api/orders/user/route.ts

// Importations nécessaires depuis Next.js pour gérer les requêtes et réponses API,
// et depuis mysql2 pour interagir avec la base de données.
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Votre module de connexion à la base de données
import { RowDataPacket } from 'mysql2'; // Type pour les lignes brutes de la base de données

// --- DÉBUT : LOGIQUE D'AUTHENTIFICATION SERVEUR (PLACEHOLDER - À SÉCURISER) ---
// Cette fonction tente d'identifier l'utilisateur basé sur un header personnalisé.
// ATTENTION : Ce n'est PAS une méthode d'authentification sécurisée pour un environnement de production.
// En production, vous devriez utiliser des tokens JWT vérifiés ou des sessions serveur.
async function getCurrentUserId(req: NextRequest): Promise<number | null> {
  // Récupère la valeur du header 'X-User-ID' envoyé par le client.
  const userIdFromHeader = req.headers.get('X-User-ID'); 
  
  // Log pour déboguer ce que l'API reçoit.
  console.log(`API /api/orders/user - getCurrentUserId: Header X-User-ID reçu: "${userIdFromHeader}"`);

  if (userIdFromHeader) {
    // Tente de convertir la valeur du header en nombre entier.
    const userId = parseInt(userIdFromHeader, 10);
    // Vérifie si la conversion a réussi et si l'ID est un nombre positif.
    if (!isNaN(userId) && userId > 0) {
      console.log(`API /api/orders/user - getCurrentUserId: Utilisateur ID ${userId} parsé avec succès depuis le header.`);
      return userId; // Retourne l'ID utilisateur si valide.
    } else {
      console.warn(`API /api/orders/user - getCurrentUserId: La valeur du header X-User-ID ("${userIdFromHeader}") n'est pas un nombre valide positif.`);
    }
  } else {
     console.warn("API /api/orders/user - getCurrentUserId: Header X-User-ID non trouvé ou vide dans la requête.");
  }
  
  // --- OPTION DE TEST (à décommenter si besoin pour forcer un ID) ---
  // const TEST_USER_ID = 1; // Remplacez 1 par un ID utilisateur valide de votre table `user` qui a des commandes.
  // console.log(`API /api/orders/user - getCurrentUserId: FORÇAGE à l'ID ${TEST_USER_ID} pour test.`);
  // return TEST_USER_ID;
  // --- FIN OPTION DE TEST ---

  console.warn("API /api/orders/user - getCurrentUserId: Retourne null (aucun utilisateur identifié).");
  return null; // Retourne null si l'utilisateur ne peut pas être identifié.
}
// --- FIN : LOGIQUE D'AUTHENTIFICATION SERVEUR ---


// Interface pour les données d'une commande telles qu'elles viennent de la table 'orders'.
interface UserOrderFromDB extends RowDataPacket {
  id: number;
  user_id: number | null; // user_id peut être null si vous autorisez les commandes invitées.
  total_amount: string;   // DECIMAL est souvent retourné comme une chaîne par node-mysql2.
  status: string;
  client_nom: string;
  client_email: string;
  created_at: Date;       // DATETIME ou TIMESTAMP devient un objet Date.
}

// Interface pour un article d'une commande tel qu'il vient de la table 'order_items'.
interface UserOrderItemFromDB extends RowDataPacket {
  id: number; // ID de l'enregistrement order_items.
  service_id: number;
  nom_service: string;
  quantite: number;
  prix_unitaire: string; // DECIMAL.
  sub_total: string;     // DECIMAL.
}

// Fonction handler pour les requêtes GET sur cette route.
export async function GET(req: NextRequest) {
  console.log("API GET /api/orders/user: Début du traitement de la requête.");
  
  // Tente d'identifier l'utilisateur qui fait la requête.
  const userId = await getCurrentUserId(req); 

  // Si aucun utilisateur n'est identifié, renvoyer une erreur 401 (Non Autorisé).
  if (!userId) {
    console.log("API GET /api/orders/user: Utilisateur non authentifié. Réponse 401.");
    return NextResponse.json({ error: 'Non authentifié. Impossible de récupérer les commandes.' }, { status: 401 });
  }

  console.log(`API GET /api/orders/user: Récupération des commandes pour l'utilisateur ID: ${userId}`);

  try {
    // 1. Récupérer les enregistrements de commandes principaux pour l'utilisateur spécifié.
    // Les commandes sont triées par date de création, la plus récente en premier.
    const [ordersRows] = await db.execute<UserOrderFromDB[]>(
      "SELECT id, user_id, total_amount, status, client_nom, client_email, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [userId] // Utiliser l'ID utilisateur dans la clause WHERE pour filtrer les commandes.
    );
    console.log(`API GET /api/orders/user: ${ordersRows.length} commande(s) principale(s) trouvée(s) pour l'utilisateur ${userId}.`);

    const userOrdersWithDetails = []; // Tableau pour stocker les commandes complètes avec leurs articles.

    // 2. Pour chaque commande récupérée, aller chercher les articles associés.
    for (const orderData of ordersRows) {
      console.log(`API GET /api/orders/user: Récupération des items pour la commande ID: ${orderData.id}`);
      const [itemsRows] = await db.execute<UserOrderItemFromDB[]>(
        "SELECT id, service_id, nom_service, quantite, prix_unitaire, sub_total FROM order_items WHERE order_id = ?",
        [orderData.id] // Filtrer les articles par l'ID de la commande actuelle.
      );
      console.log(`API GET /api/orders/user: ${itemsRows.length} item(s) trouvé(s) pour la commande ID: ${orderData.id}`);
      
      // Construire l'objet de commande final pour la réponse JSON.
      userOrdersWithDetails.push({
        ...orderData, // Inclure toutes les propriétés de la commande principale.
        total_amount: parseFloat(orderData.total_amount), // Convertir le montant total en nombre.
        // Formater la date de création dans un format lisible pour la France.
        created_at: new Date(orderData.created_at).toLocaleDateString('fr-FR', { 
            day: '2-digit', month: 'long', year: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        }),
        // Mapper sur les articles pour les inclure et convertir leurs prix/sous-totaux en nombres.
        items: itemsRows.map(item => ({
            ...item,
            prix_unitaire: parseFloat(item.prix_unitaire),
            sub_total: parseFloat(item.sub_total)
        }))
      });
    }
    
    console.log("API GET /api/orders/user: Toutes les commandes et items récupérés et formatés. Envoi de la réponse.");
    // Renvoyer le tableau des commandes (avec leurs articles) au client.
    return NextResponse.json(userOrdersWithDetails);

  } catch (error) {
    console.error(`Erreur API GET /api/orders/user pour l'utilisateur ID ${userId}:`, error);
    // En cas d'erreur pendant le traitement, renvoyer une erreur serveur 500.
    return NextResponse.json({ error: 'Erreur serveur lors de la récupération des commandes de l\'utilisateur.' }, { status: 500 });
  }
}