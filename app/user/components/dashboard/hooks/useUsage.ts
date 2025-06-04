import { useState, useEffect } from 'react'
import { useAuth } from '../../../../contexts/AuthContext'
import { z } from 'zod'

const UsageSchema = z.object({
  prompts_used: z.number(),
  prompts_limit: z.number().nullable(),
  can_create_prompt: z.boolean(),
})

export type Usage = z.infer<typeof UsageSchema>

const UsageReturnSchema = z.object({
  usage: UsageSchema.nullable(),
  loading: z.boolean(),
  error: z.string().nullable(),
  refetch: z.function(),
})

export type UseUsageReturn = z.infer<typeof UsageReturnSchema>

// Hook for managing user usage tracking
export function useUsage(): UseUsageReturn {
  const { isAuthenticated } = useAuth()
  const [usage, setUsage] = useState<Usage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsage = async () => {
    if (!isAuthenticated) {
      setUsage(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/usage')
      const data = await response.json()
      
      if (response.ok) {
        const usageData: Usage = {
          prompts_used: data.prompts_used,
          prompts_limit: data.prompts_limit,
          can_create_prompt: data.can_create_prompt
        }
        
        setUsage(usageData)
      } else {
        // Default to 0 usage if API fails
        setUsage({
          prompts_used: 0,
          prompts_limit: 5,
          can_create_prompt: true
        })
      }
    } catch (err) {
      console.error('Error fetching usage:', err)
      setError('Failed to fetch usage data')
      // Default to 0 usage if fetch fails
      setUsage({
        prompts_used: 0,
        prompts_limit: 5,
        can_create_prompt: true
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsage()
  }, [isAuthenticated])

  return {
    usage,
    loading,
    error,
    refetch: fetchUsage
  }
} 