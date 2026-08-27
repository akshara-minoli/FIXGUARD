import { z } from "zod";

export const userIdParamsSchema = z.object({
  id: z.uuid("User ID must be a valid UUID"),
});
