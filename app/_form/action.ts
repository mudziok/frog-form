"use server";

import { createUserSchema } from "./schema";
import { actionHandler } from "./actionHandler";

export const createUser = actionHandler({
  schema: createUserSchema,
  action: async ({ data }) => {
    console.log(data);
    return data;
  },
});
