import OpenAI from "openai";
import { z } from 'zod'

export const OpenAIConfigSchema = z.object({
  apiKey: z.string().optional(),
  organization: z.string().optional(),
  baseURL: z.string().optional()
})

export const OpenAIRequestSchema = z.object({
  model: z.string(),
  input: z.string(),
  maxTokens: z.number().optional()
})

export const OpenAIResponseSchema = z.object({
  outputText: z.string(),
  usage: z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number()
  }).optional()
})

type OpenAIConfig = z.infer<typeof OpenAIConfigSchema>
type OpenAIRequest = z.infer<typeof OpenAIRequestSchema>
type OpenAIResponse = z.infer<typeof OpenAIResponseSchema>

// Pure function
function createOpenAIClient(config: OpenAIConfig): OpenAI {
  return new OpenAI(config)
}

// Pure function  
export async function generateResponse(
  request: OpenAIRequest, 
  config: OpenAIConfig = {}
): Promise<z.infer<typeof OpenAIResponseSchema>> {
  const client = createOpenAIClient(config)
  
  try {
    const response = await client.chat.completions.create({
      model: request.model,
      messages: [{ role: "user", content: request.input }],
      max_tokens: request.maxTokens
    })

    const result = {
      outputText: response.choices[0]?.message?.content || "",
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,  
        totalTokens: response.usage.total_tokens
      } : undefined
    }

    return OpenAIResponseSchema.parse(result)
  } catch (error) {
    throw new Error(`OpenAI API Error: ${error}`)
  }
}