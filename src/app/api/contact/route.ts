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

// Déclare une fonction asynchrone exportée, qui sera appelée lors d'une requête HTTP POST
export async function POST(req: NextRequest) {
  try {
    // Récupère le corps de la requête en le convertissant depuis du JSON
    const body = await req.json();
    // Déstructure les champs attendus depuis le corps de la requête
    const { nom, prenom, email, telephone, objet, message } = body;

    // Vérifie que tous les champs requis sont présents
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
  try {
    // Exécution de la requête SQL pour récupérer les messages de contact depuis la base de données.
    // On récupère les colonnes : id, nom, prénom, téléphone, objet, email, message, et la date d'envoi.
    // Les résultats sont triés par date d'envoi décroissante (les plus récents en premier).
    const [messagesFromDB] = await db.execute<ContactMessage[]>(
      'SELECT id, nom, prenom, telephone, objet, email, message, date_envoyee FROM contact ORDER BY date_envoyee DESC'
    );
    
    // On stocke les messages récupérés dans une variable pour éventuellement pouvoir les manipuler.
    const messages = messagesFromDB; 

    // On retourne la liste des messages au format JSON dans la réponse HTTP.
    return NextResponse.json(messages);

  } catch (error) {
    // En cas d'erreur (ex : problème avec la base de données), on loggue l'erreur dans la console serveur.
    console.error('Erreur API GET /api/contact:', error);

    // Puis on renvoie une réponse JSON avec un message d'erreur et un status 500 (erreur serveur).
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des messages de contact.' },
      { status: 500 }
    );
  }
}