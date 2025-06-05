import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db' // Ajustez le chemin
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nom, prenom, email, password } = body // confirmPassword est géré côté client

    if (!nom || !prenom || !email || !password) {
      return NextResponse.json({ error: 'Tous les champs sont obligatoires.' }, { status: 400 })
    }

    // Vérifie si l'email existe déjà (table 'user')
    const [existingUserRows] = await db.execute( // Assurez-vous d'utiliser RowDataPacket[] si vous typez fortement
      'SELECT id FROM user WHERE email = ?',
      [email]
    );
    // @ts-ignore - ou mieux, typez existingUserRows comme RowDataPacket[]
    if (existingUserRows.length > 0) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const defaultRole = 'Utilisateur'; // Rôle par défaut pour les nouveaux utilisateurs

    await db.execute(
      'INSERT INTO user (nom, prenom, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [nom, prenom, email, hashedPassword, defaultRole] // Insertion du rôle par défaut
    )

    return NextResponse.json({ success: true, message: 'Inscription réussie.' })
  } catch (error) {
    console.error('Erreur d\'inscription API:', error)
    return NextResponse.json({ error: 'Erreur serveur lors de l\'inscription.' }, { status: 500 })
  }
}