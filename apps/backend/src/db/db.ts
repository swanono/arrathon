import { Pool, PoolClient, QueryResult } from 'pg';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max?: number; // nombre max de connexions
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

// Pool global
let pool: Pool | null = null;

// Initialiser la connexion
export function initDatabase(config: DatabaseConfig): void {
  pool = new Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    max: config.max || 20,
    idleTimeoutMillis: config.idleTimeoutMillis || 30000,
    connectionTimeoutMillis: config.connectionTimeoutMillis || 2000,
  });

  // Gestion des erreurs du pool
  pool.on('error', (err) => {
    console.error('Erreur de connexion PostgreSQL:', err);
  });
}

// Obtenir le pool (avec vérification)
function getPool(): Pool {
  if (!pool) {
    throw new Error('Database non initialisée. Appelez initDatabase() d\'abord.');
  }
  return pool;
}

// Exécuter une requête simple
export async function query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const client = await getPool().connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Exécuter une requête et retourner seulement les rows
export async function queryRows<T = any>(text: string, params?: any[]): Promise<T[]> {
  const result = await query<T>(text, params);
  return result.rows;
}

// Exécuter une requête et retourner la première ligne
export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const result = await query<T>(text, params);
  return result.rows[0] || null;
}

// Transaction
export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Insérer et retourner l'ID
export async function insert(table: string, data: Record<string, any>): Promise<number> {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  
  const queryText = `
    INSERT INTO ${table} (${keys.join(', ')}) 
    VALUES (${placeholders}) 
    RETURNING id
  `;
  
  const result = await queryOne<{ id: number }>(queryText, values);
  return result?.id || 0;
}

// Mettre à jour
export async function update(table: string, data: Record<string, any>, where: Record<string, any>): Promise<number> {
  const setClause = Object.keys(data).map((key, i) => `${key} = $${i + 1}`).join(', ');
  const whereClause = Object.keys(where).map((key, i) => `${key} = $${i + 1 + Object.keys(data).length}`).join(' AND ');
  
  const queryText = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
  const values = [...Object.values(data), ...Object.values(where)];
  
  const result = await query(queryText, values);
  return result.rowCount || 0;
}

// Supprimer
export async function deleteFrom(table: string, where: Record<string, any>): Promise<number> {
  const whereClause = Object.keys(where).map((key, i) => `${key} = $${i + 1}`).join(' AND ');
  const queryText = `DELETE FROM ${table} WHERE ${whereClause}`;
  
  const result = await query(queryText, Object.values(where));
  return result.rowCount || 0;
}

// Sélectionner avec conditions
export async function select<T = any>(
  table: string, 
  columns: string[] = ['*'], 
  where?: Record<string, any>,
  orderBy?: string,
  limit?: number
): Promise<T[]> {
  let queryText = `SELECT ${columns.join(', ')} FROM ${table}`;
  const values: any[] = [];

  if (where && Object.keys(where).length > 0) {
    const whereClause = Object.keys(where).map((key, i) => `${key} = $${i + 1}`).join(' AND ');
    queryText += ` WHERE ${whereClause}`;
    values.push(...Object.values(where));
  }

  if (orderBy) {
    queryText += ` ORDER BY ${orderBy}`;
  }

  if (limit) {
    queryText += ` LIMIT ${limit}`;
  }

  return queryRows<T>(queryText, values);
}

// Compter les enregistrements
export async function count(table: string, where?: Record<string, any>): Promise<number> {
  let queryText = `SELECT COUNT(*) as count FROM ${table}`;
  const values: any[] = [];

  if (where && Object.keys(where).length > 0) {
    const whereClause = Object.keys(where).map((key, i) => `${key} = $${i + 1}`).join(' AND ');
    queryText += ` WHERE ${whereClause}`;
    values.push(...Object.values(where));
  }

  const result = await queryOne<{ count: string }>(queryText, values);
  return parseInt(result?.count || '0');
}

// Vérifier si un enregistrement existe
export async function exists(table: string, where: Record<string, any>): Promise<boolean> {
  const recordCount = await count(table, where);
  return recordCount > 0;
}

// Fermer toutes les connexions
export async function close(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// Tester la connexion
export async function testConnection(): Promise<boolean> {
  try {
    await query('SELECT NOW()');
    return true;
  } catch (error) {
    console.error('Test de connexion échoué:', error);
    return false;
  }
}

// Configuration par défaut pour le dev local
export const defaultConfig: DatabaseConfig = {
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB ?? 'devdb',
  user: process.env.POSTGRES_USER ?? 'devuser',
  password: process.env.POSTGRES_PASSWORD ?? 'devpassword',
};

// Auto-initialisation avec config par défaut (optionnel)
initDatabase(defaultConfig);