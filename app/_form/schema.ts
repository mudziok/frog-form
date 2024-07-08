import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
  details: z.object({
    username: z.string().min(1),
  }),
});
