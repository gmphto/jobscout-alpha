import { z } from 'zod'
import { UserSchema } from '../types'

export const UserStateSchema = z.object({
  currentUser: UserSchema.nullable(),
  isLoading: z.boolean().default(false),
  error: z.string().nullable().default(null)
})

export type UserState = z.infer<typeof UserStateSchema> 