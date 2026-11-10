import { z } from "zod";

export const UpdateUserProfileSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  username: z.string().min(2, "Username must be at least 2 characters").optional()
});

export interface UpdateUserProfileDTO {
  userId: string;
  email?: string;
  username?: string;
}
