import { z } from "zod";

export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  family_name: z.string(),
  email: z.string(),
  google_id: z.string().optional(),
  avatar_url: z.string().url().optional(),
  date_of_birth: z.string().date().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});
