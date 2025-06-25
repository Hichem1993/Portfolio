import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db' // Importation de la connexion à la base de données
import bcrypt from 'bcryptjs' // Librairie pour le hachage de mots de passe

// Fonction de gestion de la requête POST pour l'inscription
export async function POST(req: NextRequest) {
  try {
    // Récupération des données JSON envoyées dans la requête
    const body = await req.json()
    const { nom, prenom, email, password } = body // confirmPassword est géré côté client

    // Vérifie que tous les champs requis sont présents
    if (!nom || !prenom || !email || !password) {
      return NextResponse.json({ error: 'Tous les champs sont obligatoires.' }, { status: 400 })
    }

    // Vérifie si l'email est déjà présent dans la base de données (table 'user')
    const [existingUserRows] = await db.execute( // La requête retourne les lignes correspondantes
      'SELECT id FROM user WHERE email = ?',
      [email]
    );
    // @ts-ignore - Ignore l'erreur TypeScript ici, ou utilisez RowDataPacket[] pour typer correctement
    if (existingUserRows.length > 0) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 400 })
    }

    // Hash du mot de passe avec un coût de 10
    const hashedPassword = await bcrypt.hash(password, 10)
    const defaultRole = 'Utilisateur'; // Rôle par défaut attribué au nouvel utilisateur

    // Insertion de l'utilisateur dans la base de données avec les informations fournies
    await db.execute(
      'INSERT INTO user (nom, prenom, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [nom, prenom, email, hashedPassword, defaultRole] // Insertion avec le mot de passe hashé et rôle par défaut
    )

    // Retourne une réponse de succès si tout s'est bien passé
    return NextResponse.json({ success: true, message: 'Inscription réussie.' })
  } catch (error) {
    // En cas d'erreur lors du traitement, log l'erreur et retourne un message d'erreur serveur
    console.error('Erreur d\'inscription API:', error)
    return NextResponse.json({ error: 'Erreur serveur lors de l\'inscription.' }, { status: 500 })
  }
}