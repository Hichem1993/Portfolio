// src/app/api/contact/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; 
import { RowDataPacket } from 'mysql2'; // Ajoutez RowDataPacket pour typer la réponse GET

// Interface pour les données d'un message de contact (pour la fonction GET)
export interface ContactMessage extends RowDataPacket {
  id: number;
  nom: string;
  prenom: string;
  telephone: string | null;
  objet: string;
  email: string;
  message: string;
  date_envoyee: Date | string; 
}

// Votre fonction POST existante (inchangée)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nom, prenom, email, telephone, objet, message } = body;

    if (!nom || !prenom || !email || !telephone || !objet || !message) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants.' },
        { status: 400 }
      );
    }

    // date_envoyee sera gérée par DEFAULT CURRENT_TIMESTAMP dans la DB ou NOW()
    await db.execute(
      'INSERT INTO contact (nom, prenom, email, telephone, objet, message, date_envoyee) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [nom, prenom, email, telephone, objet, message]
    );

    return NextResponse.json({
      success: true,
      message: 'Message enregistré avec succès.',
    });
  } catch (error) {
    console.error("Erreur API POST /api/contact:", error); // Logguer l'erreur côté serveur
    return NextResponse.json({ error: 'Erreur serveur lors de l\'enregistrement du message.' }, { status: 500 });
  }
}


// FONCTION GET pour lister tous les messages de contact
export async function GET(req: NextRequest) {
  console.log("API GET /api/contact: Requête reçue pour lister tous les messages de contact.");
  try {
    // TODO: Sécuriser cette route pour qu'elle ne soit accessible qu'aux administrateurs
    // via une VRAIE vérification de session/token serveur.

    const [messagesFromDB] = await db.execute<ContactMessage[]>(
      'SELECT id, nom, prenom, telephone, objet, email, message, date_envoyee FROM contact ORDER BY date_envoyee DESC' // Les plus récents en premier
    );
    
    // NextResponse.json s'occupera de sérialiser les objets Date en chaînes ISO.
    // Le client (ContactManagement.tsx) s'occupera du formatage final pour l'affichage.
    // Aucune transformation de map n'est strictement nécessaire ici si le client gère la date.
    const messages = messagesFromDB; 

    console.log(`API GET /api/contact: ${messages.length} messages trouvés.`);
    return NextResponse.json(messages);

  } catch (error) {
    console.error('Erreur API GET /api/contact:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des messages de contact.' },
      { status: 500 }
    );
  }
}