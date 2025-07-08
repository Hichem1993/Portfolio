import mysql from 'mysql2/promise'

// createPool permet de réutiliser les connexions à la base de données, ce qui est plus performant qu'ouvrir une nouvelle connexion à chaque requête.
export const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'portfolio',
})