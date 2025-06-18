// src/app/api/user/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Assurez-vous que ce chemin est correct
import bcrypt from 'bcryptjs'; // Importez bcryptjs
import { RowDataPacket, ResultSetHeader } from 'mysql2';


export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = params.id;
  console.log(`API: Requête PUT /api/users/${userId} reçue`);
  // Idéalement, ajoutez une vérification serveur pour l'admin ici
  try {
    const body = await req.json();
    const { nom, prenom, email, role, password } = body;

    if (!nom || !prenom || !email || !role) {
      return NextResponse.json({ error: 'Nom, prénom, email et rôle sont requis.' }, { status: 400 });
    }

    let query = 'UPDATE user SET nom = ?, prenom = ?, email = ?, role = ?';
    const queryParams: (string | number)[] = [nom, prenom, email, role];

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = ?';
      queryParams.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    queryParams.push(userId);

    await db.execute<ResultSetHeader>(query, queryParams);

    return NextResponse.json({ success: true, message: 'Utilisateur mis à jour.' });
  } catch (error) {
    console.error(`--- ERREUR DÉTAILLÉE API PUT /api/users/${userId} ---`);
    console.error(error);
    console.error('--- FIN ERREUR DÉTAILLÉE ---');
    return NextResponse.json({ error: `Erreur serveur (PUT /api/users/${userId}). Vérifiez les logs.` }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const userIdToDelete = params.id;
  console.log(`API: Requête DELETE /api/users/${userIdToDelete} reçue`);
  // Idéalement, ajoutez une vérification serveur pour l'admin ici
  // ET vérifiez que l'admin ne se supprime pas lui-même au niveau serveur

  try {
    const [userRows] = await db.execute<RowDataPacket[]>(
        'SELECT id FROM user WHERE id = ?',
        [userIdToDelete]
    );
    if (userRows.length === 0) {
      return NextResponse.json({ error: 'Utilisateur non trouvé.' }, { status: 404 });
    }

    await db.execute<ResultSetHeader>('DELETE FROM user WHERE id = ?', [userIdToDelete]);
    return NextResponse.json({ success: true, message: 'Utilisateur supprimé.' });
  } catch (error) {
    console.error(`--- ERREUR DÉTAILLÉE API DELETE /api/users/${userIdToDelete} ---`);
    console.error(error);
    console.error('--- FIN ERREUR DÉTAILLÉE ---');
    return NextResponse.json({ error: `Erreur serveur (DELETE /api/users/${userIdToDelete}). Vérifiez les logs.` }, { status: 500 });
  }
}
