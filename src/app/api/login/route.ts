import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db' // Ajustez le chemin
import bcrypt from 'bcryptjs'
import { RowDataPacket } from 'mysql2'

interface UserRecord extends RowDataPacket {
  id: number;
  email: string;
  password_hash: string; // Nom de votre colonne de mot de passe hashé (ex: 'password')
  nom?: string;
  prenom?: string;
  role: string; // Rôle de l'utilisateur
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password: plainTextPassword } = body

    if (!email || !plainTextPassword) {
      return NextResponse.json({ error: 'Email et mot de passe sont requis.' }, { status: 400 })
    }

    // Assurez-vous que la colonne de mot de passe (ici 'password') et 'role' sont sélectionnées
    const [rows] = await db.execute<UserRecord[]>(
      'SELECT id, email, password, nom, prenom, role FROM user WHERE email = ?', // Assurez-vous que la colonne s'appelle 'password'
      [email]
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect.' }, { status: 401 })
    }

    const userFromDb = rows[0];
    // Adaptez 'userFromDb.password' au nom exact de votre colonne de mot de passe hashé
    const hashedPasswordFromDb = userFromDb.password;


    if (!hashedPasswordFromDb) {
        console.error("Le hash du mot de passe n'a pas été trouvé pour l'utilisateur:", userFromDb.email);
        return NextResponse.json({ error: 'Erreur de configuration du compte.' }, { status: 500 });
    }

    const isPasswordValid = await bcrypt.compare(plainTextPassword, hashedPasswordFromDb)

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect.' }, { status: 401 })
    }

    // Exclure le mot de passe hashé de la réponse
    const { password, ...userToReturn } = userFromDb // Si la colonne est 'password'
    // Si la colonne est 'password_hash', alors:
    // const { password_hash, ...userToReturn } = userFromDb

    return NextResponse.json({
      success: true,
      message: 'Connexion réussie.',
      user: userToReturn, // userToReturn inclut maintenant 'id', 'email', 'nom', 'prenom', 'role'
    })

  } catch (error) {
    console.error('Erreur de connexion API:', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}