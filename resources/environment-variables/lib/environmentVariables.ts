import { z } from "zod";
import { EnvironmentVariablesError } from "@resource/errors";

export const environmentVariablesSchema = z.object({
  DB_HOST: z.string(),
  DB_PORT: z.string(),
  DB_NAME: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
});

export function getEnvironmentVariables() {
  try {
    return environmentVariablesSchema.parse(process.env);
  } catch (error) {
    throw new EnvironmentVariablesError();
  }
}
