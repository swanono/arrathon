import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema/index.ts';

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString);

export const db = drizzle(client, { schema });

export * from './schema/index.ts';
export type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
