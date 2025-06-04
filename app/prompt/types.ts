import { z } from 'zod'

// Database-aligned prompt schema
export const PromptSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string(),
  content: z.string(),
  company: z.string().nullable(),
  position: z.string().nullable(),
  category: z.string().default('general'),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).default('pending'),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string()
})

export const CreatePromptSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(10, 'Job post content must be at least 10 characters'),
  company: z.string().optional(),
  position: z.string().optional(),
  category: z.string().default('general')
})

// Generated content schemas
export const GeneratedContentSchema = z.object({
  id: z.string(),
  prompt_id: z.string(),
  user_id: z.string(),
  bullet_points: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
  summary: z.string().nullable(),
  openai_model: z.string().default('gpt-4o-mini'),
  processing_time_ms: z.number().nullable(),
  created_at: z.string()
})

// Request/response schemas for API
export const ProcessPromptRequestSchema = z.object({
  jobPost: z.string().min(10, 'Job post must be at least 10 characters'),
  title: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional()
})

export const ProcessPromptResponseSchema = z.object({
  prompt_id: z.string().optional(),
  generated_content: GeneratedContentSchema.optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  usage: z.object({
    canCreate: z.boolean(),
    used: z.number(),
    limit: z.number().nullable(),
  }).optional(),
})

// Inferred types
export type Prompt = z.infer<typeof PromptSchema>
export type CreatePrompt = z.infer<typeof CreatePromptSchema>
export type GeneratedContent = z.infer<typeof GeneratedContentSchema>
export type ProcessPromptRequest = z.infer<typeof ProcessPromptRequestSchema>
export type ProcessPromptResponse = z.infer<typeof ProcessPromptResponseSchema> 