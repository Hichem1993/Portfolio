import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Assurez-vous que ce chemin est correct
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import bcrypt from 'bcryptjs'; // Importez bcryptjs

interface UserData extends RowDataPacket {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  date_creation: string;
}

export async function GET(req: NextRequest) {
  console.log("API: Requête GET /api/users reçue");
  try {
    // Idéalement, ajoutez une vérification serveur pour l'admin ici

    const [users] = await db.execute<UserData[]>(
      'SELECT id, nom, prenom, email, role, date_creation FROM user ORDER BY id ASC'
    );

    console.log("API: Utilisateurs récupérés de la DB:", users.length);
    return NextResponse.json(users);

  } catch (error) {
    console.error('--- ERREUR DÉTAILLÉE API GET /api/users ---');
    console.error(error);
    console.error('--- FIN ERREUR DÉTAILLÉE ---');
    return NextResponse.json({ error: 'Erreur serveur (GET /api/users). Vérifiez les logs.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  console.log("API: Requête POST /api/users reçue");
  // Idéalement, ajoutez une vérification serveur pour l'admin ici
  try {
    const body = await req.json();
    const { nom, prenom, email, password, role = 'Utilisateur' } = body;

    if (!nom || !prenom || !email || !password) {
      return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 });
    }

    const [existingUserRows] = await db.execute<RowDataPacket[]>(
        'SELECT id FROM user WHERE email = ?',
        [email]
    );

    if (existingUserRows.length > 0) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute<ResultSetHeader>(
      'INSERT INTO user (nom, prenom, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [nom, prenom, email, hashedPassword, role]
    );
    
    const insertId = result.insertId;
    return NextResponse.json({ success: true, message: 'Utilisateur ajouté.', userId: insertId }, { status: 201 });

  } catch (error) {
    console.error('--- ERREUR DÉTAILLÉE API POST /api/users ---');
    console.error(error);
    console.error('--- FIN ERREUR DÉTAILLÉE ---');
    return NextResponse.json({ error: 'Erreur serveur (POST /api/users). Vérifiez les logs.' }, { status: 500 });
  }
}
