// Importation des types et fonctions nécessaires de Next.js
import { NextRequest, NextResponse } from 'next/server';
// Importation de l'instance de base de données personnalisée
import { db } from '@/lib/db';
// Importation des types de retour SQL pour un typage plus strict
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Interface représentant un article dans le panier pour l'API
interface ApiCartItem {
  service_id: number; // ID du service
  nom: string; // Nom du service
  quantite: number; // Quantité commandée
  prix_unitaire: string | number; // Prix unitaire (string depuis la DB, number après parsing)
  image_url?: string | null; // URL de l'image (facultative)
  slugs?: string; // Slug du service
  main_category_slugs?: string; // Slug de la catégorie principale
  sub_category_slugs?: string; // Slug de la sous-catégorie
}

// Fonction simulant l'identification d'un utilisateur (ici toujours ID 1 pour test)
async function getCurrentUserId(req: NextRequest): Promise<number | null> {
  const TEST_USER_ID = 1; // ID fictif pour développement
  console.log(`API /api/cart (ou item): getCurrentUserId appelé. Retourne ID ${TEST_USER_ID} pour test.`);
  if (TEST_USER_ID) {
    return TEST_USER_ID;
  }
  return null; // Retourne null si aucun ID (dans un vrai cas, après vérification token/session)
}

// Fonction qui récupère les articles du panier d'un utilisateur donné
async function getUserCartItems(userId: number): Promise<ApiCartItem[]> {
  console.log(`API Helper: getUserCartItems appelé pour userId: ${userId}`);
  const [rows] = await db.execute<RowDataPacket[]>(
    `SELECT 
       ci.service_id, s.nom, ci.quantite, ci.prix_unitaire, 
       s.image_url, s.slugs, c.slugs AS main_category_slugs, sc.slugs AS sub_category_slugs
     FROM cart_items ci
     JOIN services s ON ci.service_id = s.id
     JOIN sous_categorie sc ON s.id_sous_categorie = sc.id
     JOIN categories c ON sc.id_categorie = c.id
     WHERE ci.user_id = ? ORDER BY ci.id ASC`,
    [userId] // Paramètre utilisateur injecté dans la requête
  );
  // Transformation des données SQL en format exploitable côté API
  const cartItems = rows.map(item => ({
    service_id: item.service_id,
    nom: item.nom,
    quantite: Number(item.quantite),
    prix_unitaire: parseFloat(item.prix_unitaire),
    image_url: item.image_url,
    slugs: item.slugs,
    main_category_slugs: item.main_category_slugs,
    sub_category_slugs: item.sub_category_slugs,
  }));
  console.log(`API Helper: getUserCartItems pour userId ${userId} a trouvé ${cartItems.length} items.`);
  return cartItems;
}

// Route GET /api/cart – Récupération des articles du panier de l'utilisateur
export async function GET(req: NextRequest) {
  console.log("API GET /api/cart: Requête reçue.");
  const userId = await getCurrentUserId(req); // Récupération de l'utilisateur
  if (!userId) return NextResponse.json({ error: 'Non authentifié (API GET)' }, { status: 401 });
  try {
    const cartItems = await getUserCartItems(userId); // Récupération du panier
    return NextResponse.json(cartItems); // Renvoi des articles
  } catch (error) {
    console.error('API GET /api/cart Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur récupération panier' }, { status: 500 });
  }
}

// Route POST /api/cart – Ajout ou mise à jour d'un article dans le panier
export async function POST(req: NextRequest) {
  console.log("API POST /api/cart: Requête reçue.");
  const userId = await getCurrentUserId(req); // Récupération de l'utilisateur
  console.log("API POST /api/cart: User ID déterminé:", userId);
  if (!userId) return NextResponse.json({ error: 'Non authentifié (API POST)' }, { status: 401 });

  try {
    const body = await req.json(); // Lecture du corps de la requête JSON
    console.log("API POST /api/cart: Body reçu:", JSON.stringify(body));
    const { service_id, quantite = 1, prix_unitaire, nom, image_url, slugs, main_category_slugs, sub_category_slugs } = body;

    // Validation des données reçues
    if (!service_id || typeof quantite !== 'number' || quantite <= 0 || typeof prix_unitaire !== 'number') {
      console.error("API POST /api/cart: Données invalides:", body);
      return NextResponse.json({ error: 'Données invalides pour ajout/màj panier' }, { status: 400 });
    }
    
    // Vérifie si le service est disponible
    const [serviceCheck] = await db.execute<RowDataPacket[]>("SELECT prix FROM services WHERE id = ? AND est_disponible = TRUE", [service_id]);
    if (serviceCheck.length === 0) {
        console.error("API POST /api/cart: Service non trouvé ou indisponible pour ID:", service_id);
        return NextResponse.json({ error: 'Service non trouvé ou indisponible.' }, { status: 404 });
    }

    // Ajout ou mise à jour de l'article dans la table cart_items
    console.log(`API POST /api/cart: Exécution DB pour user ${userId}, service ${service_id}, qté ${quantite}, prix ${prix_unitaire}`);
    await db.execute(
      `INSERT INTO cart_items (user_id, service_id, quantite, prix_unitaire) VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE quantite = cart_items.quantite + VALUES(quantite), prix_unitaire = VALUES(prix_unitaire)`,
      [userId, service_id, quantite, prix_unitaire]
    );
    console.log("API POST /api/cart: Opération DB terminée.");

    // Récupère et renvoie le panier mis à jour
    const updatedCart = await getUserCartItems(userId);
    console.log("API POST /api/cart: Panier mis à jour retourné:", JSON.stringify(updatedCart));
    return NextResponse.json(updatedCart);
  } catch (error: any) {
    console.error('API POST /api/cart ERREUR SERVEUR:', error);
    // Gestion d'erreur SQL spécifique : clé étrangère invalide
    if (error.code === 'ER_NO_REFERENCED_ROW_2') return NextResponse.json({ error: 'Service ID invalide dans la requête.'}, { status: 400});
    return NextResponse.json({ error: 'Erreur serveur ajout/màj panier.' }, { status: 500 });
  }
}

// Route DELETE /api/cart – Suppression de tous les articles du panier de l'utilisateur
export async function DELETE(req: NextRequest) {
  console.log("API DELETE /api/cart: Requête reçue pour vider le panier.");
  const userId = await getCurrentUserId(req); // Récupération de l'utilisateur
  if (!userId) return NextResponse.json({ error: 'Non authentifié (API DELETE global)' }, { status: 401 });
  try {
    // Suppression de toutes les entrées du panier pour l'utilisateur
    await db.execute<ResultSetHeader>('DELETE FROM cart_items WHERE user_id = ?', [userId]);
    console.log(`API DELETE /api/cart: Panier vidé pour l'utilisateur ID ${userId}.`);
    return NextResponse.json([]); // Retourne un tableau vide après suppression
  } catch (error) {
    console.error('API DELETE /api/cart Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur suppression panier global' }, { status: 500 });
  }
}
