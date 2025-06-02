import { z } from 'zod'

export const PromptSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.enum(['resume', 'cover-letter', 'skills', 'experience']),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const CreatePromptSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.enum(['resume', 'cover-letter', 'skills', 'experience'])
})

export const UpdatePromptSchema = CreatePromptSchema.partial()

export type Prompt = z.infer<typeof PromptSchema>
export type CreatePrompt = z.infer<typeof CreatePromptSchema>
export type UpdatePrompt = z.infer<typeof UpdatePromptSchema> 