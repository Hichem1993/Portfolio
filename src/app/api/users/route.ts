// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import bcrypt from 'bcryptjs';

// Interface pour les données utilisateur retournées par la fonction GET
interface UserListData extends RowDataPacket {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  date_creation: Date | string; // La DB retourne Date, JSON.stringify la convertit en string ISO
}

// Fonction GET pour lister tous les utilisateurs (pour le dashboard admin)
export async function GET(req: NextRequest) {
  console.log("API GET /api/users: Requête reçue pour lister tous les utilisateurs.");
  try {
    // TODO: Implémenter une VRAIE vérification pour s'assurer que seul un admin peut appeler cette route.
    // Pour l'instant, elle est ouverte.

    const [usersFromDB] = await db.execute<UserListData[]>(
      'SELECT id, nom, prenom, email, role, date_creation FROM user ORDER BY id ASC'
    );

    // S'assurer que date_creation est dans un format que le client peut facilement parser
    // NextResponse.json s'occupe de la sérialisation des objets Date en chaînes ISO.
    const users = usersFromDB.map(user => ({
        ...user,
        // Si date_creation est déjà un objet Date, c'est bon.
        // Si c'est une chaîne de la DB, new Date() dans le client la gérera.
    }));

    console.log(`API GET /api/users: ${users.length} utilisateurs trouvés et retournés.`);
    return NextResponse.json(users);

  } catch (error) {
    console.error('Erreur API GET /api/users:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des utilisateurs.' },
      { status: 500 }
    );
  }
}

// Fonction POST pour ajouter un nouvel utilisateur (utilisée par la modale du dashboard admin)
export async function POST(req: NextRequest) {
    console.log("API POST /api/users: Requête reçue pour ajouter un utilisateur.");
    // TODO: Implémenter une VRAIE vérification pour s'assurer que seul un admin peut appeler cette route.
    try {
        const body = await req.json();
        const { nom, prenom, email, password, role = 'Utilisateur' } = body; // Rôle par défaut si non fourni

        if (!nom || !prenom || !email || !password) {
            return NextResponse.json({ error: 'Champs requis manquants (nom, prenom, email, password).' }, { status: 400 });
        }

        // Vérifier si l'email existe déjà
        const [existingUserRows] = await db.execute<RowDataPacket[]>('SELECT id FROM user WHERE email = ?', [email]);
        if (existingUserRows.length > 0) {
            return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.execute<ResultSetHeader>(
            'INSERT INTO user (nom, prenom, email, password, role, date_creation) VALUES (?, ?, ?, ?, ?, NOW())', // Ajout de NOW() pour date_creation
            [nom, prenom, email, hashedPassword, role]
        );
        
        const newUserId = result.insertId;
        // Récupérer l'utilisateur nouvellement créé pour le renvoyer
        const [newUserRows] = await db.execute<UserListData[]>("SELECT id, nom, prenom, email, role, date_creation FROM user WHERE id = ?", [newUserId]);

        if (newUserRows.length === 0) {
            throw new Error("L'utilisateur a été créé mais n'a pas pu être récupéré.");
        }

        console.log(`API POST /api/users: Utilisateur ID ${newUserId} ajouté avec succès.`);
        return NextResponse.json({ success: true, message: 'Utilisateur ajouté avec succès.', user: newUserRows[0] }, { status: 201 });

    } catch (error) {
        console.error('Erreur API POST /api/users:', error);
        return NextResponse.json({ error: 'Erreur serveur lors de l\'ajout de l\'utilisateur.' }, { status: 500 });
    }
}