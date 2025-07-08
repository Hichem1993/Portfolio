import { NextRequest, NextResponse } from 'next/server' // Importation des types et fonctions nécessaires pour une API route Next.js
import { db } from '@/lib/db' // Connexion à la base de données (adapter le chemin selon votre structure)
import bcrypt from 'bcryptjs' // Bibliothèque pour comparer les mots de passe hashés
import { RowDataPacket } from 'mysql2' // Type pour les lignes de résultats MySQL

// Définition de l'interface représentant la structure d'un utilisateur retourné par la base
interface UserRecord extends RowDataPacket {
  id: number;               // Identifiant unique de l'utilisateur
  email: string;            // Adresse email
  password_hash: string;    // Champ de mot de passe hashé (selon le nom réel dans la BDD)
  nom?: string;             // Nom de l'utilisateur (facultatif)
  prenom?: string;          // Prénom de l'utilisateur (facultatif)
  role: string;             // Rôle de l'utilisateur (admin, user, etc.)
}

// Fonction qui gère la requête HTTP POST pour la connexion
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() // Récupération du corps JSON de la requête
    const { email, password: plainTextPassword } = body // Extraction de l'email et du mot de passe

    // Vérifie que l'email et le mot de passe sont fournis
    if (!email || !plainTextPassword) {
      return NextResponse.json({ error: 'Email et mot de passe sont requis.' }, { status: 400 })
    }

    // Requête SQL pour récupérer l'utilisateur correspondant à l'email
    const [rows] = await db.execute<UserRecord[]>(
      'SELECT id, email, password, nom, prenom, role FROM user WHERE email = ?', // S'assurer que les noms de colonnes sont corrects
      [email]
    )

    // Si aucun utilisateur trouvé, retour d'une erreur
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect.' }, { status: 401 })
    }

    const userFromDb = rows[0]; // Récupère le premier (et seul) utilisateur trouvé
    const hashedPasswordFromDb = userFromDb.password; // Récupère le mot de passe hashé stocké en base

    // Vérifie que le mot de passe hashé est bien présent (sinon problème de données)
    if (!hashedPasswordFromDb) {
        console.error("Le hash du mot de passe n'a pas été trouvé pour l'utilisateur:", userFromDb.email);
        return NextResponse.json({ error: 'Erreur de configuration du compte.' }, { status: 500 });
    }

    // Compare le mot de passe en clair fourni avec le hash en base
    const isPasswordValid = await bcrypt.compare(plainTextPassword, hashedPasswordFromDb)

    // Si la comparaison échoue, mot de passe incorrect
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect.' }, { status: 401 })
    }

    // Exclut le mot de passe de la réponse retournée au client
    const { password, ...userToReturn } = userFromDb 

    // Envoie une réponse JSON avec les infos de l'utilisateur (hors mot de passe)
    return NextResponse.json({
      success: true,
      message: 'Connexion réussie.',
      user: userToReturn, // Contient id, email, nom, prénom, rôle
    })

  } catch (error) {
    // En cas d'erreur inattendue (ex: problème de BDD), renvoie une erreur serveur
    console.error('Erreur de connexion API:', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
