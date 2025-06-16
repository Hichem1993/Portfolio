// src/app/api/user/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Assurez-vous que ce chemin est correct
import { ResultSetHeader, RowDataPacket } from 'mysql2';
// Adaptez getCurrentUserId à votre système d'authentification serveur
// Pour l'instant, il retourne un ID fixe pour test.
async function getCurrentUserId(req: NextRequest): Promise<number | null> {
  console.warn("API /api/user/profile: getCurrentUserId est un placeholder.");
  // En production, implémentez la vérification de session/token ici.
  const TEST_USER_ID = 1; // IMPORTANT: Utilisez un ID existant pour tester
  console.log(`API /api/user/profile: Utilisation de TEST_USER_ID = ${TEST_USER_ID}`);
  return TEST_USER_ID; 
}

interface ProfileUpdateBody {
  nom?: string;
  prenom?: string;
}

export async function PUT(req: NextRequest) {
  const userId = await getCurrentUserId(req);
  console.log("API PUT /api/user/profile - User ID:", userId);

  if (!userId) {
    return NextResponse.json({ error: 'Non authentifié. Impossible de mettre à jour le profil.' }, { status: 401 });
  }

  try {
    const body: ProfileUpdateBody = await req.json();
    console.log("API PUT /api/user/profile - Body reçu:", body);
    const { nom, prenom } = body;

    // Vérifier qu'il y a quelque chose à mettre à jour et que les valeurs ne sont pas juste des espaces vides
    const nomTrimmed = typeof nom === 'string' ? nom.trim() : undefined;
    const prenomTrimmed = typeof prenom === 'string' ? prenom.trim() : undefined;

    if (!nomTrimmed && !prenomTrimmed) {
      console.log("API PUT /api/user/profile - Aucune donnée valide (nom/prénom) à mettre à jour.");
      return NextResponse.json({ error: 'Aucune donnée valide (nom ou prénom) fournie pour la mise à jour.' }, { status: 400 });
    }

    let query = 'UPDATE user SET ';
    const paramsToUpdate: (string | number)[] = [];
    const fieldsToUpdate: string[] = [];

    if (nomTrimmed) { // Utiliser la valeur "trimmée"
      fieldsToUpdate.push('nom = ?');
      paramsToUpdate.push(nomTrimmed);
    }
    if (prenomTrimmed) { // Utiliser la valeur "trimmée"
      fieldsToUpdate.push('prenom = ?');
      paramsToUpdate.push(prenomTrimmed);
    }
    
    // Cette condition est redondante si la première validation est bonne, mais ne fait pas de mal
    if (fieldsToUpdate.length === 0) {
        return NextResponse.json({ error: 'Aucun champ valide à mettre à jour après traitement.' }, { status: 400 });
    }

    query += fieldsToUpdate.join(', ') + ' WHERE id = ?';
    paramsToUpdate.push(userId);

    console.log("API PUT /api/user/profile - Exécution Query:", query, "Avec Params:", paramsToUpdate);
    const [result] = await db.execute<ResultSetHeader>(query, paramsToUpdate);
    console.log("API PUT /api/user/profile - Résultat DB:", result);

    if (result.affectedRows === 0) {
      // Peut arriver si l'ID utilisateur n'existe pas, ou si les données soumises sont identiques aux valeurs existantes.
      // Dans le cas de données identiques, on veut quand même renvoyer l'utilisateur comme si c'était un succès.
      console.warn("API PUT /api/user/profile - Profil non trouvé ou aucune modification nécessaire (données identiques?).");
      const [existingUserRows] = await db.execute<RowDataPacket[]>("SELECT id, nom, prenom, email, role FROM user WHERE id = ?", [userId]);
      if (existingUserRows.length > 0) {
          return NextResponse.json({ success: true, message: 'Aucune modification détectée, profil actuel retourné.', user: existingUserRows[0] });
      }
      return NextResponse.json({ error: "Profil utilisateur non trouvé." }, { status: 404 });
    }

    // Récupérer l'utilisateur mis à jour pour le renvoyer (afin de mettre à jour AuthContext)
    const [updatedUserRows] = await db.execute<RowDataPacket[]>("SELECT id, nom, prenom, email, role FROM user WHERE id = ?", [userId]);
    if (updatedUserRows.length === 0) {
        console.error("API PUT /api/user/profile - ERREUR CRITIQUE: Utilisateur mis à jour (affectedRows > 0) mais introuvable après coup.");
        return NextResponse.json({ error: "Erreur lors de la récupération du profil mis à jour après modification." }, { status: 500 });
    }
    
    console.log("API PUT /api/user/profile - Profil mis à jour avec succès:", updatedUserRows[0]);
    return NextResponse.json({ success: true, message: 'Profil mis à jour avec succès.', user: updatedUserRows[0] });

  } catch (error) {
    console.error('Erreur API PUT /api/user/profile:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la mise à jour du profil.' }, { status: 500 });
  }
}