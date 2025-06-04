'use client'

import React, { useState } from 'react'
import { z } from 'zod'
import { useUsage } from '../../../../user/components/dashboard/hooks/useUsage'

export const CreatePromptModalPropsSchema = z.object({
  isOpen: z.boolean(),
  onClose: z.function(),
  onSuccess: z.function().optional()
})

type CreatePromptModalProps = z.infer<typeof CreatePromptModalPropsSchema>

export default function CreatePromptModal(props: CreatePromptModalProps) {
  const { isOpen, onClose, onSuccess } = props
  
  const [jobPost, setJobPost] = useState('')
  const [company, setCompany] = useState('')
  const [position, setPosition] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState('')

  // Get usage information
  const { usage, loading: usageLoading, refetch: refetchUsage } = useUsage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!jobPost.trim() || isLoading) return

    // Check usage limit before submitting
    if (usage && !usage.can_create_prompt) {
      setError(`You've reached your monthly limit of ${usage.prompts_limit} prompts. Upgrade to Pro for unlimited AI-generated resume content.`)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobPost: jobPost.trim(),
          title: title.trim() || undefined,
          company: company.trim() || undefined,
          position: position.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 403 && data.needsUpgrade) {
          // Show upgrade message for usage limit exceeded
          setError(`${data.message} Please upgrade to continue creating AI-powered resume content.`)
          return
        }
        
        setError(data.error || 'Failed to process job posting')
        return
      }

      // Success
      setJobPost('')
      setTitle('')
      setCompany('')
      setPosition('')
      onClose()
      
      // Refresh usage after successful submission
      refetchUsage()
      
      // Trigger refresh of prompts list
      onSuccess?.(data)
      
    } catch (error) {
      console.error('Error submitting prompt:', error)
      setError('Failed to process job posting. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (!isSubmitting) {
      setJobPost('')
      setCompany('')
      setPosition('')
      setError(null)
      onClose()
    }
  }

  if (!isOpen) return null

  const isAtLimit = usage && !usage.can_create_prompt
  const isNearLimit = usage && usage.prompts_limit && usage.prompts_used >= usage.prompts_limit * 0.8

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Create New Prompt
            </h2>
            <button
              onClick={handleCancel}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Usage Display */}
        {!usageLoading && usage && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span>Monthly usage: </span>
                <span className="font-medium">
                  {usage.prompts_used}{usage.prompts_limit && ` / ${usage.prompts_limit}`}
                </span>
                <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  Free Plan
                </span>
              </div>
              {usage.prompts_limit && (
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isAtLimit
                        ? 'bg-red-600'
                        : isNearLimit
                        ? 'bg-yellow-600'
                        : 'bg-blue-600'
                    }`}
                    style={{ 
                      width: `${Math.min((usage.prompts_used / usage.prompts_limit) * 100, 100)}%` 
                    }}
                  />
                </div>
              )}
            </div>
            
            {isAtLimit && (
              <div className="mt-2 text-sm text-red-600">
                You've reached your monthly limit. Check back next month for more free prompts.
              </div>
            )}
            
            {isNearLimit && !isAtLimit && (
              <div className="mt-2 text-sm text-yellow-600">
                {usage.prompts_limit! - usage.prompts_used} prompts remaining this month.
              </div>
            )}
          </div>
        )}

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="px-6 py-4 flex-1 overflow-y-auto">
            <div className="space-y-4">
              {/* Optional fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Company (Optional)
                  </label>
                  <input
                    type="text"
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g., Google, Microsoft"
                    disabled={isSubmitting || isAtLimit}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                    Position (Optional)
                  </label>
                  <input
                    type="text"
                    id="position"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="e.g., Software Engineer, Product Manager"
                    disabled={isSubmitting || isAtLimit}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Job post content */}
              <div>
                <label htmlFor="jobPost" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Post Content *
                </label>
                <textarea
                  id="jobPost"
                  value={jobPost}
                  onChange={(e) => setJobPost(e.target.value)}
                  placeholder="Paste the complete job posting here..."
                  disabled={isSubmitting || isAtLimit}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:bg-gray-100 disabled:opacity-50"
                />
                <div className="mt-1 text-sm text-gray-500">
                  {jobPost.length}/2000 characters
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                      {error.includes('upgrade') && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            Please try again next month or contact support for assistance.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Processing info */}
              {isLoading && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <p className="text-sm text-blue-600">
                      Processing with AI... This may take 10-30 seconds.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || jobPost.trim().length < 10 || isAtLimit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                  Processing...
                </>
              ) : isAtLimit ? (
                'Upgrade Required'
              ) : (
                'Generate Resume Content'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 