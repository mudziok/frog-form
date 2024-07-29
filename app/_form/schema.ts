import { z } from "zod";
import { zfd } from "zod-form-data";

export const createUserSchema = z.object({
  email: zfd.text(),
  password: zfd.text(),
  avatar: zfd.file(),
  details: z.object({
    username: zfd.text(),
    language: z.enum(["English", "Spanish", "French"]),
    gender: z.enum(["Male", "Female", "Other"]),
    interests: zfd.repeatableOfType(z.enum(["Sports", "Programming"])),
  }),
});
