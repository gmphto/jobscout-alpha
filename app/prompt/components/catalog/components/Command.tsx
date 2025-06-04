'use client'

import React, { useState } from 'react'
import { z } from 'zod'
import { useAuth } from '../../../../contexts/AuthContext'

export const CommandPropsSchema = z.object({
  activeFilter: z.enum(['new', 'top', 'trending']),
  searchTerm: z.string(),
  onFilterChange: z.function(),
  onSearchChange: z.function(),
  onCreatePrompt: z.function(),
  totalCount: z.number().optional(),
  filteredCount: z.number().optional()
})

type CommandProps = z.infer<typeof CommandPropsSchema>

export default function Command(props: CommandProps) {
  const { 
    activeFilter, 
    searchTerm, 
    onFilterChange, 
    onSearchChange, 
    onCreatePrompt,
    totalCount = 0,
    filteredCount = 0
  } = props
  const { isAuthenticated } = useAuth()

  const clearSearch = () => {
    onSearchChange('')
  }

  const getFilterLabel = (filter: string) => {
    switch (filter) {
      case 'new': return 'Recent'
      case 'top': return 'Best'
      case 'trending': return 'Popular'
      default: return filter
    }
  }

  const getFilterDescription = (filter: string) => {
    switch (filter) {
      case 'new': return 'Recently created prompts'
      case 'top': return 'Fastest processing & completed'
      case 'trending': return 'Completed with full content'
      default: return ''
    }
  }

  return (
    <div className="border-b border-gray-200">
      {/* Header Section */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Resume Content</h1>
            {totalCount > 0 && (
              <p className="text-sm text-gray-500 mt-0.5">
                {searchTerm ? (
                  <>{filteredCount} of {totalCount} prompts</>
                ) : (
                  <>{totalCount} prompt{totalCount !== 1 ? 's' : ''} total</>
                )}
              </p>
            )}
          </div>
          
          <button 
            onClick={onCreatePrompt}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Prompt
          </button>
        </div>
      </div>

      {/* Controls Section */}
      <div className="px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search Section */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search prompts..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  title="Clear search"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Filter Section */}
          <div className="flex items-center gap-6">
            {/* Sort Filters */}
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-500 mr-2">Sort:</span>
              {(['new', 'top', 'trending'] as const).map((filter) => (
                <button 
                  key={filter}
                  onClick={() => onFilterChange(filter)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    activeFilter === filter 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title={getFilterDescription(filter)}
                >
                  {getFilterLabel(filter)}
                </button>
              ))}
            </div>

            {/* Quick Status Filters */}
            <div className="flex items-center gap-1 pl-6 border-l border-gray-200">
              <span className="text-sm text-gray-500 mr-2">Quick:</span>
              <button 
                onClick={() => onSearchChange('completed')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  searchTerm === 'completed'
                    ? 'bg-green-100 text-green-700 ring-1 ring-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Show completed prompts"
              >
                ✅ Done
              </button>
              <button 
                onClick={() => onSearchChange('processing')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  searchTerm === 'processing'
                    ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Show processing prompts"
              >
                ⏳ Active
              </button>
            </div>
          </div>
        </div>

        {/* Active search indicator */}
        {searchTerm && searchTerm !== 'completed' && searchTerm !== 'processing' && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-gray-500">Searching for:</span>
            <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium border border-blue-200">
              "{searchTerm}"
              <button
                onClick={clearSearch}
                className="ml-2 text-blue-500 hover:text-blue-700"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          </div>
        )}
      </div>
    </div>
  )
} 