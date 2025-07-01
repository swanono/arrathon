import {
  createUserQuery,
  getUserByEmailQuery,
  getUserByIdQuery,
  updateUserByIdQuery,
} from "./sql-queries.js";
import { pool } from "../database.js";
import { userSchema } from "./schemas.js";
import {
  GetUserByEmailQueryError,
  GetUserByIdQueryError,
  CreateUserQueryError,
  UpdateUserQueryError,
} from "@resource/errors";
import { z } from "zod";

type User = z.infer<typeof userSchema>;

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const queryResult = await pool.query(getUserByEmailQuery, [email]);
    return userSchema.parse(queryResult);
  } catch {
    throw new GetUserByEmailQueryError(email);
  }
}

export async function getUserById(id: number): Promise<User | null> {
  try {
    const queryResult = await pool.query(getUserByIdQuery, [id]);
    return userSchema.parse(queryResult);
  } catch {
    throw new GetUserByIdQueryError(id);
  }
}

export async function createUser({
  name,
  family_name,
  email,
  google_id,
  avatar_url,
}: {
  name: string;
  family_name: string;
  email: string;
  google_id: string;
  avatar_url: string;
}): Promise<User> {
  try {
    const queryResult = await pool.query(createUserQuery, [
      name,
      family_name,
      email,
      google_id,
      avatar_url,
    ]);
    return userSchema.parse(queryResult);
  } catch {
    throw new CreateUserQueryError();
  }
}

function formatQueryString(record: { [key: string]: unknown }) {
  const values: unknown[] = [];
  let valuesString = "";
  let index = 0;
  for (const [key, value] of Object.entries(record)) {
    valuesString = `${valuesString} ${key} = $${index + 2},`;
    values.push(value);
    index++;
  }
  return { valuesString, values };
}

export async function updateUser(
  id: number,
  {
    name,
    family_name,
    date_of_birth,
  }: {
    name?: string;
    family_name?: string;
    date_of_birth?: string;
  },
) {
  const { valuesString, values } = formatQueryString({
    name,
    family_name,
    date_of_birth,
  });
  try {
    const updateUserQueryString = updateUserByIdQuery(valuesString);
    const queryResult = pool.query(updateUserQueryString, [id, ...values]);
    return userSchema.parse(queryResult);
  } catch {
    throw new UpdateUserQueryError();
  }
}
