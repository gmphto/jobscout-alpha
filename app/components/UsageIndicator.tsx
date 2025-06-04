'use client'

import { useUsage } from '../user/components/dashboard/hooks/useUsage'
import { z } from 'zod'

export const UsageIndicatorPropsSchema = z.object({
  showText: z.boolean().optional().default(true),
  size: z.enum(['sm', 'md']).optional().default('md'),
})

export type UsageIndicatorProps = z.infer<typeof UsageIndicatorPropsSchema>

export default function UsageIndicator(props: UsageIndicatorProps = {}) {
  const { showText = true, size = 'md' } = props
  const { usage, loading } = useUsage()

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className={`${size === 'sm' ? 'w-6 h-2' : 'w-8 h-2'} bg-gray-200 rounded-full animate-pulse`}></div>
        {showText && <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>}
      </div>
    )
  }

  if (!usage) return null

  const percentage = usage.prompts_limit 
    ? Math.min((usage.prompts_used / usage.prompts_limit) * 100, 100)
    : 0

  const isAtLimit = usage && !usage.can_create_prompt
  const isNearLimit = usage && usage.prompts_limit && usage.prompts_used >= usage.prompts_limit * 0.8

  return (
    <div className="flex items-center gap-2">
      {/* Progress bar */}
      <div className={`${size === 'sm' ? 'w-6 h-2' : 'w-8 h-2'} bg-gray-200 rounded-full overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isAtLimit
              ? 'bg-red-500'
              : isNearLimit
              ? 'bg-yellow-500'
              : 'bg-blue-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Usage text */}
      {showText && (
        <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'} font-medium ${
          isAtLimit
            ? 'text-red-600'
            : isNearLimit
            ? 'text-yellow-600'
            : 'text-gray-600'
        }`}>
          {usage.prompts_used}/{usage.prompts_limit}
        </span>
      )}
      
      {/* Badge */}
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${size === 'sm' ? 'text-xs' : 'text-xs'} font-medium bg-blue-100 text-blue-800`}>
        Free
      </span>
    </div>
  )
} 