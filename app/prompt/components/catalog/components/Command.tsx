'use client'

import React from 'react'
import { z } from 'zod'
import { useAuth } from '../../../../contexts/AuthContext'

export const CommandPropsSchema = z.object({
  activeFilter: z.enum(['new', 'top', 'trending']),
  searchTerm: z.string(),
  onFilterChange: z.function(),
  onSearchChange: z.function(),
  onCreatePrompt: z.function()
})

type CommandProps = z.infer<typeof CommandPropsSchema>

export default function Command(props: CommandProps) {
  const { activeFilter, searchTerm, onFilterChange, onSearchChange, onCreatePrompt } = props
  const { isAuthenticated } = useAuth()

  return (
    <div className="border-b border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Filter buttons */}
        <div className="flex gap-2">
          <button 
            onClick={() => onFilterChange('new')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeFilter === 'new' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            🕐 New
          </button>
          <button 
            onClick={() => onFilterChange('top')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeFilter === 'top' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            📈 Top
          </button>
          <button 
            onClick={() => onFilterChange('trending')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeFilter === 'trending' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            🔥 Trending
          </button>
        </div>

        {/* Search and actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search input */}
          <div className="relative flex-1 sm:flex-initial">
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
              className="block w-full sm:w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filter icon */}
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
            </svg>
          </button>

          {/* Create prompt button */}
          <button 
            onClick={onCreatePrompt}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {isAuthenticated ? 'Create new prompt' : 'Sign in to create'}
          </button>
        </div>
      </div>
    </div>
  )
} 