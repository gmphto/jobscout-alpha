'use client'

import { useUsage } from '../hooks/useUsage'

export default function UsageDisplay() {
  const { usage, loading } = useUsage()

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!usage) return null

  const percentage = usage.prompts_limit 
    ? Math.round((usage.prompts_used / usage.prompts_limit) * 100)
    : 0

  const isNearLimit = usage.prompts_limit && usage.prompts_used >= usage.prompts_limit * 0.8
  const isAtLimit = usage.prompts_limit && usage.prompts_used >= usage.prompts_limit

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Usage This Month</h3>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Free Plan
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm font-medium text-gray-900 mb-2">
            <span>AI Resume Content Generated</span>
            <span>
              {usage.prompts_used}
              {usage.prompts_limit && ` / ${usage.prompts_limit}`}
            </span>
          </div>
          
          {usage.prompts_limit && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isAtLimit
                    ? 'bg-red-600'
                    : isNearLimit
                    ? 'bg-yellow-600'
                    : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          )}
        </div>

        {isAtLimit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-red-800">Usage Limit Reached</h4>
                <p className="text-sm text-red-700 mt-1">
                  You've used all {usage.prompts_limit} prompts this month. Check back next month for more free AI-generated resume content.
                </p>
              </div>
            </div>
          </div>
        )}

        {isNearLimit && !isAtLimit && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-yellow-800">Approaching Limit</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  You have {usage.prompts_limit! - usage.prompts_used} prompts remaining this month.
                </p>
              </div>
            </div>
          </div>
        )}

        {usage.can_create_prompt && !isNearLimit && (
          <div className="text-sm text-gray-600">
            <p>✨ {usage.prompts_limit! - usage.prompts_used} AI-generated resume contents remaining this month</p>
          </div>
        )}
      </div>
    </div>
  )
} 