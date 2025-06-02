'use client'

import React, { useState } from 'react'
import { z } from 'zod'

export const CreatePromptModalPropsSchema = z.object({
  isOpen: z.boolean(),
  onClose: z.function(),
  onSubmit: z.function().optional()
})

type CreatePromptModalProps = z.infer<typeof CreatePromptModalPropsSchema>

export default function CreatePromptModal(props: CreatePromptModalProps) {
  const { isOpen, onClose, onSubmit } = props
  const [jobPost, setJobPost] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!jobPost.trim()) return
    
    setIsSubmitting(true)
    try {
      await onSubmit?.(jobPost.trim())
      setJobPost('')
      onClose()
    } catch (error) {
      console.error('Error creating prompt:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setJobPost('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Create New Prompt
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <label htmlFor="jobPost" className="block text-sm font-medium text-gray-700 mb-2">
              Paste Job Post
            </label>
            <textarea
              id="jobPost"
              value={jobPost}
              onChange={(e) => setJobPost(e.target.value)}
              placeholder="Paste the job posting here and we'll generate tailored resume bullets and skills for you..."
              className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Character count */}
          <div className="text-sm text-gray-500 mb-6">
            {jobPost.length} characters
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!jobPost.trim() || isSubmitting}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            {isSubmitting ? 'Creating...' : 'Generate Resume Content'}
          </button>
        </div>
      </div>
    </div>
  )
} 