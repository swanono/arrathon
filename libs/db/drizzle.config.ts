import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/*.ts',
  out: './migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  extensionsFilters: ['postgis'], // CRITICAL — prevents PostGIS system table interference
  schemaFilter: ['public'],
  strict: true,
  verbose: true,
});
