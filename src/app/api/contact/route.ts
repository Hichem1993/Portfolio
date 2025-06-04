import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db' 

export async function POST(req: NextRequest) {
  try {
    // Récupère les données JSON envoyées depuis le formulaire
    const body = await req.json()
    const { nom, prenom, email, telephone, objet, message } = body

    // Vérifie que certains champs sont bien remplis (validation minimale)
    if (!nom || !prenom || !email || !telephone || !objet || !message) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants.' },
        { status: 400 }
      )
    }

    // Requête SQL d'insertion dans la table "contact"
    await db.execute(
      'INSERT INTO contact (nom, prenom, email, telephone, objet, message) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, prenom, email, telephone, objet, message]
    )

    // Répond au client avec un message de succès
    return NextResponse.json({
      success: true,
      message: 'Message enregistré avec succès.',
    })
  } catch (error) {
    // Répond au client avec un message d’erreur
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
