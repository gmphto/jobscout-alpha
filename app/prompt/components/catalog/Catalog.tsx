import React, { useMemo } from 'react'
import { z } from 'zod'
import { PromptSchema } from '../../types'

export const CatalogPropsSchema = z.object({
  prompts: z.array(PromptSchema).optional(),
  searchTerm: z.string().optional(),
  categoryFilter: z.string().optional()
})

type CatalogProps = z.infer<typeof CatalogPropsSchema>

// Pure function
function getColorIndicator(category: string): string {
  const colorMap: Record<string, string> = {
    'resume': 'bg-blue-500',
    'cover-letter': 'bg-green-500', 
    'skills': 'bg-purple-500',
    'experience': 'bg-orange-500'
  }
  return colorMap[category] || 'bg-gray-500'
}

export default function Catalog(props: CatalogProps) {
  const { prompts = [], searchTerm, categoryFilter } = props

  // Memoized filtering to optimize performance
  const filteredPrompts = useMemo(() => {
    return [...prompts].filter(prompt => {
      const matchesSearch = !searchTerm || 
        prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.content.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = !categoryFilter || prompt.category === categoryFilter
      
      return matchesSearch && matchesCategory && prompt.isActive
    })
  }, [prompts, searchTerm, categoryFilter])

  // Show empty state when no prompts
  if (filteredPrompts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-8 py-12 flex flex-col items-center justify-center min-h-[600px]">
              <div className="max-w-md mx-auto text-center">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                  No Submissions Yet
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  If you would like to say something click<br />
                  the button below to join the<br />
                  conversation.
                </p>
                <button className="text-gray-500 font-semibold inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create first post
                </button>
              </div>

              {/* Sample submission cards */}
              <div className="mt-16 w-full max-w-2xl space-y-4">
                <div className="bg-gray-50 rounded-lg border border-gray-100 p-6 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-4 h-4 bg-blue-500 rounded-full ml-4"></div>
                </div>

                <div className="bg-gray-50 rounded-lg border border-gray-100 p-6 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-3 w-2/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="w-4 h-4 bg-green-500 rounded-full ml-4"></div>
                </div>

                <div className="bg-gray-50 rounded-lg border border-gray-100 p-6 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-3 w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  <div className="w-4 h-4 bg-purple-500 rounded-full ml-4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show actual prompts when available
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="space-y-4">
              {filteredPrompts.map(prompt => (
                <div key={prompt.id} className="bg-gray-50 rounded-lg border border-gray-100 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {prompt.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-2">
                      {prompt.content}
                    </p>
                    <span className="inline-block mt-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {prompt.category}
                    </span>
                  </div>
                  <div className={`w-4 h-4 ${getColorIndicator(prompt.category)} rounded-full ml-4 flex-shrink-0`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 