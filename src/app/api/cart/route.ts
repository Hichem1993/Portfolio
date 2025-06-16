// src/app/api/cart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Interface pour les données d'un item de panier attendues/retournées par l'API
// Note: prix_unitaire est string ici car DECIMAL vient comme string de la DB,
// mais le CartContext le voudra en nombre. La conversion se fait dans getUserCartItems ou dans le contexte.
interface ApiCartItem {
  service_id: number;
  nom: string;
  quantite: number;
  prix_unitaire: string | number; // Peut être string de la DB, ou nombre après parsing
  image_url?: string | null;
  slugs?: string;
  main_category_slugs?: string;
  sub_category_slugs?: string;
}

// --- POINT CRUCIAL POUR LE TEST ---
// Remplacez cette fonction par VOTRE vraie logique d'authentification serveur dès que possible.
async function getCurrentUserId(req: NextRequest): Promise<number | null> {
  const TEST_USER_ID = 1; // <<< METTEZ ICI L'ID D'UN UTILISATEUR EXISTANT DANS VOTRE BDD POUR TESTER
  console.log(`API /api/cart (ou item): getCurrentUserId appelé. Retourne ID ${TEST_USER_ID} pour test.`);
  // Simulez une session valide pour cet utilisateur de test
  if (TEST_USER_ID) {
    return TEST_USER_ID;
  }
  // En réalité, vous vérifieriez un token JWT, une session NextAuth, etc.
  // Si aucune session valide n'est trouvée:
  // console.warn("API /api/cart: Aucune session utilisateur valide trouvée.");
  return null;
}
// --- FIN DU POINT CRUCIAL ---

async function getUserCartItems(userId: number): Promise<ApiCartItem[]> {
  console.log(`API Helper: getUserCartItems appelé pour userId: ${userId}`);
  const [rows] = await db.execute<RowDataPacket[]>( // Utiliser RowDataPacket ici, puis mapper vers ApiCartItem
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
    service_id: item.service_id,
    nom: item.nom,
    quantite: Number(item.quantite),
    prix_unitaire: parseFloat(item.prix_unitaire), // Convertir en nombre ici
    image_url: item.image_url,
    slugs: item.slugs,
    main_category_slugs: item.main_category_slugs,
    sub_category_slugs: item.sub_category_slugs,
  }));
  console.log(`API Helper: getUserCartItems pour userId ${userId} a trouvé ${cartItems.length} items.`);
  return cartItems;
}

export async function GET(req: NextRequest) {
  console.log("API GET /api/cart: Requête reçue.");
  const userId = await getCurrentUserId(req);
  if (!userId) return NextResponse.json({ error: 'Non authentifié (API GET)' }, { status: 401 });
  try {
    const cartItems = await getUserCartItems(userId);
    return NextResponse.json(cartItems);
  } catch (error) {
    console.error('API GET /api/cart Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur récupération panier' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  console.log("API POST /api/cart: Requête reçue.");
  const userId = await getCurrentUserId(req);
  console.log("API POST /api/cart: User ID déterminé:", userId);
  if (!userId) return NextResponse.json({ error: 'Non authentifié (API POST)' }, { status: 401 });

  try {
    const body = await req.json();
    console.log("API POST /api/cart: Body reçu:", JSON.stringify(body));
    const { service_id, quantite = 1, prix_unitaire, nom, image_url, slugs, main_category_slugs, sub_category_slugs } = body;

    if (!service_id || typeof quantite !== 'number' || quantite <= 0 || typeof prix_unitaire !== 'number') {
      console.error("API POST /api/cart: Données invalides:", body);
      return NextResponse.json({ error: 'Données invalides pour ajout/màj panier' }, { status: 400 });
    }
    
    const [serviceCheck] = await db.execute<RowDataPacket[]>("SELECT prix FROM services WHERE id = ? AND est_disponible = TRUE", [service_id]);
    if (serviceCheck.length === 0) {
        console.error("API POST /api/cart: Service non trouvé ou indisponible pour ID:", service_id);
        return NextResponse.json({ error: 'Service non trouvé ou indisponible.' }, { status: 404 });
    }

    console.log(`API POST /api/cart: Exécution DB pour user ${userId}, service ${service_id}, qté ${quantite}, prix ${prix_unitaire}`);
    await db.execute(
      `INSERT INTO cart_items (user_id, service_id, quantite, prix_unitaire) VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE quantite = cart_items.quantite + VALUES(quantite), prix_unitaire = VALUES(prix_unitaire)`,
      [userId, service_id, quantite, prix_unitaire]
    );
    console.log("API POST /api/cart: Opération DB terminée.");

    const updatedCart = await getUserCartItems(userId);
    console.log("API POST /api/cart: Panier mis à jour retourné:", JSON.stringify(updatedCart));
    return NextResponse.json(updatedCart);
  } catch (error: any) {
    console.error('API POST /api/cart ERREUR SERVEUR:', error);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') return NextResponse.json({ error: 'Service ID invalide dans la requête.'}, { status: 400});
    return NextResponse.json({ error: 'Erreur serveur ajout/màj panier.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  console.log("API DELETE /api/cart: Requête reçue pour vider le panier.");
  const userId = await getCurrentUserId(req);
  if (!userId) return NextResponse.json({ error: 'Non authentifié (API DELETE global)' }, { status: 401 });
  try {
    await db.execute<ResultSetHeader>('DELETE FROM cart_items WHERE user_id = ?', [userId]);
    console.log(`API DELETE /api/cart: Panier vidé pour l'utilisateur ID ${userId}.`);
    return NextResponse.json([]); 
  } catch (error) {
    console.error('API DELETE /api/cart Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur suppression panier global' }, { status: 500 });
  }
}