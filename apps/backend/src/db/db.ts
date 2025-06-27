import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max?: number; // max number of connections
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

// Global pool
let pool: Pool | null = null;

// Initialize the connection
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

  // Handle pool errors
  pool.on('error', (err) => {
    console.error('PostgreSQL connection error:', err);
  });
}

// Get the pool (with check)
function getPool(): Pool {
  if (!pool) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return pool;
}

// Execute a simple query
export async function query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const client = await getPool().connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Execute a query and return only rows
export async function queryRows<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<T[]> {
  const result = await query<T>(text, params);
  return result.rows;
}

// Execute a query and return the first row
export async function queryOne<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<T | null> {
  const result = await query<T>(text, params);
  return result.rows[0] || null;
}

// Transaction helper
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

// Insert and return the ID
export async function insert(
  table: string,
  data: Record<string, any>,
  client?: PoolClient
): Promise<number> {
  const keys = Object.keys(data)
  const values = Object.values(data)
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ')

  const queryText = `
    INSERT INTO ${table} (${keys.join(', ')})
    VALUES (${placeholders})
    RETURNING id
  `

  if (client) { // useful for transaction
    const result = await client.query<{ id: number }>(queryText, values)
    return result.rows[0]?.id || 0
  } else {
    const result = await queryOne<{ id: number }>(queryText, values)
    return result?.id || 0
  }
}
// Update records
export async function update(table: string, data: Record<string, any>, where: Record<string, any>): Promise<number> {
  const setClause = Object.keys(data).map((key, i) => `${key} = $${i + 1}`).join(', ');
  const whereClause = Object.keys(where).map((key, i) => `${key} = $${i + 1 + Object.keys(data).length}`).join(' AND ');
  
  const queryText = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
  const values = [...Object.values(data), ...Object.values(where)];
  
  const result = await query(queryText, values);
  return result.rowCount || 0;
}

// Delete records
export async function deleteFrom(table: string, where: Record<string, any>): Promise<number> {
  const whereClause = Object.keys(where).map((key, i) => `${key} = $${i + 1}`).join(' AND ');
  const queryText = `DELETE FROM ${table} WHERE ${whereClause}`;
  
  const result = await query(queryText, Object.values(where));
  return result.rowCount || 0;
}

// Select with conditions
export async function select<T extends QueryResultRow = any>(
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

// Count records
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

// Check if a record exists
export async function exists(table: string, where: Record<string, any>): Promise<boolean> {
  const recordCount = await count(table, where);
  return recordCount > 0;
}

// Close all connections
export async function close(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    await query('SELECT NOW()');
    return true;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}

// Default config for local dev
export const defaultConfig: DatabaseConfig = {
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB ?? 'devdb',
  user: process.env.POSTGRES_USER ?? 'devuser',
  password: process.env.POSTGRES_PASSWORD ?? 'devpassword',
};

// Optional auto-init
initDatabase(defaultConfig);
