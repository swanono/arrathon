import { Pool, type PoolClient } from "pg";
import { getEnvironmentVariables } from "@resource/environment-variables";

const environmentVariables = getEnvironmentVariables();

const dbConfig = {
  host: environmentVariables.DB_HOST,
  port: Number(environmentVariables.DB_PORT),
  database: environmentVariables.DB_NAME,
  user: environmentVariables.DB_USER,
  password: environmentVariables.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pool = new Pool(dbConfig);

export const getClient = async (): Promise<PoolClient> => {
  return await pool.connect();
};

export const closePool = async (): Promise<void> => {
  await pool.end();
};
