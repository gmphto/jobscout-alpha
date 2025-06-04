'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { z } from 'zod'
import { PromptSchema } from '../../types'
import Command from './components/Command'
import CreatePromptModal from './components/CreatePromptModal'
import PromptDetails from './components/PromptDetails'
import { useAuth } from '../../../contexts/AuthContext'

export const CatalogPropsSchema = z.object({
  searchTerm: z.string().optional(),
  categoryFilter: z.string().optional()
})

type CatalogProps = z.infer<typeof CatalogPropsSchema>

// Pure function
function getColorIndicator(status: string): string {
  const colorMap: Record<string, string> = {
    'completed': 'bg-green-500',
    'processing': 'bg-blue-500',
    'pending': 'bg-yellow-500',
    'failed': 'bg-red-500'
  }
  return colorMap[status] || 'bg-gray-500'
}

// Pure function
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
  return date.toLocaleDateString()
}

export default function Catalog(props: CatalogProps) {
  const { searchTerm: initialSearchTerm = '', categoryFilter } = props
  const { isAuthenticated, openSignInModal } = useAuth()
  
  // Local state
  const [prompts, setPrompts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'new' | 'top' | 'trending'>('new')
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Fetch user prompts
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserPrompts()
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  const fetchUserPrompts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/prompts/user')
      
      if (response.ok) {
        const data = await response.json()
        setPrompts(data.prompts || [])
      } else {
        console.error('Failed to fetch prompts')
      }
    } catch (error) {
      console.error('Error fetching prompts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Memoized filtering to optimize performance
  const filteredPrompts = useMemo(() => {
    let filtered = [...prompts].filter(prompt => {
      // Search filtering
      const matchesSearch = !searchTerm || 
        prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.status.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Category filtering (if provided)
      const matchesCategory = !categoryFilter || prompt.category === categoryFilter
      
      // Only show active prompts
      return matchesSearch && matchesCategory && prompt.is_active
    })

    // Apply sorting based on active filter
    switch (activeFilter) {
      case 'new':
        // Sort by creation date (newest first)
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
        
      case 'top':
        // Sort by completion status first, then by processing time (faster = better)
        filtered.sort((a, b) => {
          // Completed prompts first
          if (a.status === 'completed' && b.status !== 'completed') return -1
          if (b.status === 'completed' && a.status !== 'completed') return 1
          
          // If both completed, sort by processing time (faster first)
          if (a.status === 'completed' && b.status === 'completed') {
            const aTime = a.generated_content?.[0]?.processing_time_ms || 999999
            const bTime = b.generated_content?.[0]?.processing_time_ms || 999999
            return aTime - bTime
          }
          
          // Otherwise sort by creation date
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
        break
        
      case 'trending':
        // Sort by recent activity - completed prompts with generated content first, then by date
        filtered.sort((a, b) => {
          // Completed with content first
          const aHasContent = a.status === 'completed' && a.generated_content?.length > 0
          const bHasContent = b.status === 'completed' && b.generated_content?.length > 0
          
          if (aHasContent && !bHasContent) return -1
          if (bHasContent && !aHasContent) return 1
          
          // Then by recent creation date
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
        break
        
      default:
        // Default to newest first
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    return filtered
  }, [prompts, searchTerm, categoryFilter, activeFilter])

  const handleCreatePrompt = () => {
    if (!isAuthenticated) {
      openSignInModal()
      return
    }
    setIsModalOpen(true)
  }

  const handlePromptSuccess = async (result: any) => {
    setSuccessMessage('Resume content generated successfully!')
    
    // Refresh the prompts list
    await fetchUserPrompts()
    
    // Clear success message after 5 seconds
    setTimeout(() => setSuccessMessage(null), 5000)
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading your prompts...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show empty state when no prompts
  if (filteredPrompts.length === 0) {
    // Check if we have prompts but they're just filtered out
    const hasPrompts = prompts.length > 0
    const isFiltered = searchTerm || activeFilter !== 'new'
    
    return (
      <>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            {/* Success message */}
            {successMessage && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">{successMessage}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <Command
                activeFilter={activeFilter}
                searchTerm={searchTerm}
                onFilterChange={setActiveFilter}
                onSearchChange={setSearchTerm}
                onCreatePrompt={handleCreatePrompt}
                totalCount={prompts.length}
                filteredCount={filteredPrompts.length}
              />
              <div className="px-8 py-12 flex flex-col items-center justify-center min-h-[600px]">
                <div className="max-w-md mx-auto text-center">
                  {hasPrompts && isFiltered ? (
                    // Has prompts but filtered out
                    <>
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-medium text-gray-900 mb-2">
                        No matching prompts found
                      </h2>
                      <p className="text-gray-600 mb-6">
                        {searchTerm ? (
                          <>No prompts match "{searchTerm}". Try adjusting your search or filters.</>
                        ) : (
                          <>No prompts match the current filter. Try a different filter option.</>
                        )}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm('')}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Clear search
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setActiveFilter('new')
                            setSearchTerm('')
                          }}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Show all prompts
                        </button>
                      </div>
                    </>
                  ) : (
                    // No prompts at all
                    <>
                      <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-medium text-gray-900 mb-4">
                        No Prompts Yet
                      </h2>
                      <p className="text-gray-600 mb-8 leading-relaxed">
                        Paste a job post → get AI-generated,<br />
                        tailored resume bullets + skills.<br />
                        Start by creating your first prompt.
                      </p>
                      <button 
                        onClick={handleCreatePrompt}
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        {isAuthenticated ? 'Create Your First Prompt' : 'Sign In to Get Started'}
                      </button>
                    </>
                  )}
                </div>

                {/* Sample submission cards - only show when no prompts at all */}
                {!hasPrompts && (
                  <div className="mt-16 w-full max-w-2xl space-y-4">
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-6 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="w-4 h-4 bg-green-500 rounded-full ml-4"></div>
                    </div>

                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-6 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-3 w-2/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                      <div className="w-4 h-4 bg-blue-500 rounded-full ml-4"></div>
                    </div>

                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-6 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-3 w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                      <div className="w-4 h-4 bg-yellow-500 rounded-full ml-4"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {isAuthenticated && (
          <CreatePromptModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={handlePromptSuccess}
          />
        )}
      </>
    )
  }

  // Show actual prompts when available
  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Success message */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <Command
              activeFilter={activeFilter}
              searchTerm={searchTerm}
              onFilterChange={setActiveFilter}
              onSearchChange={setSearchTerm}
              onCreatePrompt={handleCreatePrompt}
              totalCount={prompts.length}
              filteredCount={filteredPrompts.length}
            />
            <div className="p-6">
              <div className="space-y-4">
                {filteredPrompts.map(prompt => (
                  <div key={prompt.id} className="bg-gray-50 rounded-lg border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {prompt.title}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            prompt.status === 'completed' ? 'bg-green-100 text-green-800' :
                            prompt.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            prompt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {prompt.status}
                          </span>
                        </div>
                        
                        {prompt.company && (
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Company:</span> {prompt.company}
                          </p>
                        )}
                        
                        {prompt.position && (
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Position:</span> {prompt.position}
                          </p>
                        )}
                        
                        <p className="text-gray-600 line-clamp-2 mb-3">
                          {prompt.content.substring(0, 200)}...
                        </p>
                        
                        {/* Generated content preview */}
                        {prompt.generated_content && prompt.generated_content.length > 0 && (
                          <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 mb-2">Generated Content:</p>
                                <div className="space-y-1">
                                  {prompt.generated_content[0].bullet_points?.slice(0, 2).map((bullet: string, idx: number) => (
                                    <p key={idx} className="text-sm text-gray-600">• {bullet}</p>
                                  ))}
                                  {prompt.generated_content[0].bullet_points?.length > 2 && (
                                    <p className="text-sm text-gray-500">
                                      +{prompt.generated_content[0].bullet_points.length - 2} more bullet points
                                    </p>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedPrompt(prompt)
                                  setIsDetailsOpen(true)
                                }}
                                className="ml-3 inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-shrink-0"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {/* Show View Details button even when no generated content for completed prompts */}
                        {prompt.status === 'completed' && (!prompt.generated_content || prompt.generated_content.length === 0) && (
                          <div className="mt-3">
                            <button
                              onClick={() => {
                                setSelectedPrompt(prompt)
                                setIsDetailsOpen(true)
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              View Details
                            </button>
                          </div>
                        )}

                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <span>{formatRelativeTime(prompt.created_at)}</span>
                          {prompt.generated_content && prompt.generated_content[0]?.processing_time_ms && (
                            <span>
                              Processed in {(prompt.generated_content[0].processing_time_ms / 1000).toFixed(1)}s
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`w-4 h-4 ${getColorIndicator(prompt.status)} rounded-full ml-4 flex-shrink-0`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {isAuthenticated && (
        <>
          <CreatePromptModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={handlePromptSuccess}
          />
          {selectedPrompt && (
            <PromptDetails
              prompt={selectedPrompt}
              isOpen={isDetailsOpen}
              onClose={() => {
                setIsDetailsOpen(false)
                setSelectedPrompt(null)
              }}
            />
          )}
        </>
      )}
    </>
  )
} 